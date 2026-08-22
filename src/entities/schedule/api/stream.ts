import { axiosPublic } from "@shared/api/axios-public";
import type { MeasurementCategory, ScheduleStatus } from "@shared/model";

/**
 * 측정계획 편집 실시간 알림 구독.
 *
 * 한 기록지를 여러 사람이 섹션별로 나눠 입력하는 것이 실제 업무 방식이라, 상대 저장이 즉시
 * 반영되지 않으면 **저장을 누르기 전부터 화면의 계산값이 서로 어긋난다** — 계산 입력이
 * 섹션을 가로질러 엮여 있기 때문이다(배출가스 O₂ → 산소보정계수, 수분량 → Xw → 유속 → 유량).
 *
 * 브라우저 `EventSource` 를 쓰지 않는 이유: 액세스 토큰이 `localStorage` 에 있고 `Bearer`
 * 헤더로 실어야 하는데 `EventSource` 는 헤더를 지정할 수 없다. 토큰을 쿼리 파라미터로 넘기면
 * 액세스 로그에 남으므로 채택하지 않았고, 대신 fetch 로 스트림을 직접 읽는다.
 */

/** 서버가 보내는 시트 저장 알림. 시트 본문은 담기지 않는다 — 수신 측이 상세 조회로 최신본을 가져온다. */
export type SheetsSavedEvent = {
  scheduleId: number;
  tenantId: number;
  /** 저장한 사용자. `username` 으로 내 저장의 메아리를 걸러내고, `name` 은 안내 문구에 쓴다. */
  editor: { username: string; name: string };
  /** 이번 저장이 건드린 기록지(수정분 + 삭제분) */
  categories: MeasurementCategory[];
  status: ScheduleStatus;
};

interface Handlers {
  onSheetsSaved: (event: SheetsSavedEvent) => void;
}

const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
/** 토큰을 갱신하고도 401 이면 재시도해봐야 같은 결과다. 무한 루프를 막는다. */
const MAX_AUTH_RETRIES = 1;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const backoffMs = (attempt: number) =>
  Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);

/**
 * 소비하지 않을 응답 본문을 즉시 놓아준다. 읽지도 취소하지도 않은 body는
 * GC 될 때까지 소켓을 붙잡아, 재연결이 반복되면 오리진의 커넥션 풀을 잠식한다.
 */
const discardBody = async (res: Response) => {
  try {
    await res.body?.cancel();
  } catch {
    // 이미 닫힌 스트림이면 취소도 던진다. 정리가 목적이므로 삼킨다.
  }
};

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const res = await axiosPublic.post("/auth/refresh");
    const accessToken = res.data?.data;
    if (!accessToken) return false;

    localStorage.setItem("accessToken", accessToken);
    return true;
  } catch {
    return false;
  }
};

type Frame = { event: string; data: string };

/**
 * SSE 프레임 하나를 해석한다. `:` 로 시작하는 줄은 주석(하트비트)이므로 버린다.
 * data 는 여러 줄로 올 수 있어 개행으로 다시 이어 붙인다.
 */
const parseFrame = (raw: string): Frame | null => {
  let event = "message";
  const data: string[] = [];

  for (const line of raw.split("\n")) {
    if (line.startsWith(":")) continue;
    if (line.startsWith("event:")) event = line.slice("event:".length).trim();
    else if (line.startsWith("data:")) data.push(line.slice("data:".length).trimStart());
  }

  return data.length > 0 ? { event, data: data.join("\n") } : null;
};

/** 연결이 끊길 때까지 스트림을 읽는다. 프레임 구분자는 빈 줄이다. */
const readStream = async (
  body: ReadableStream<Uint8Array>,
  onFrame: (frame: Frame) => void,
): Promise<void> => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;

    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

    // 마지막 조각은 다음 청크와 이어질 수 있으므로 버퍼에 남긴다.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const raw of frames) {
      const frame = parseFrame(raw);
      if (frame) onFrame(frame);
    }
  }
};

/**
 * 구독을 시작하고 해제 함수를 반환한다. 연결이 끊기면 지수 백오프로 자동 재연결한다
 * (서버가 30분마다 연결을 만료시키므로 재연결은 예외가 아니라 정상 경로다).
 */
export const subscribeScheduleStream = (
  scheduleId: number,
  { onSheetsSaved }: Handlers,
): (() => void) => {
  const controller = new AbortController();
  let closed = false;

  const handleFrame = (frame: Frame) => {
    if (frame.event !== "sheets-saved") return;
    try {
      onSheetsSaved(JSON.parse(frame.data) as SheetsSavedEvent);
    } catch {
      // 해석하지 못한 프레임 때문에 구독 전체가 끊기지는 않도록 삼킨다.
    }
  };

  const run = async () => {
    let attempt = 0;
    let authRetries = 0;

    while (!closed) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/schedules/${scheduleId}/stream`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
              Accept: "text/event-stream",
            },
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (res.status === 401) {
          await discardBody(res);
          // 토큰 만료는 장시간 입력 화면에서 정상적으로 일어난다. 갱신하고 곧바로 다시 붙는다.
          if (authRetries >= MAX_AUTH_RETRIES || !(await refreshAccessToken())) return;
          authRetries += 1;
          continue;
        }
        if (!res.ok || !res.body) {
          await discardBody(res);
          throw new Error(`schedule stream ${res.status}`);
        }

        authRetries = 0;

        // 헤더만 받고 곧바로 끊기는 연결(프록시 차단 등)에서 여기서 백오프를 풀면
        // 1초 간격 재연결이 영원히 돈다. 첫 프레임을 실제로 받은 뒤에 초기화한다.
        // 서버가 구독 직후 connected 프레임을 보내므로 정상 연결이면 곧바로 걸린다.
        let opened = false;
        await readStream(res.body, (frame) => {
          if (!opened) {
            opened = true;
            attempt = 0;
          }
          handleFrame(frame);
        });
      } catch {
        if (closed || controller.signal.aborted) return;
      }

      if (closed) return;
      await delay(backoffMs(attempt));
      attempt += 1;
    }
  };

  void run();

  return () => {
    closed = true;
    controller.abort();
  };
};
