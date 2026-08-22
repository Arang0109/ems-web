import { useCallback, useEffect } from "react";
import { useBeforeUnload, useBlocker } from "react-router";

import { useConfirm } from "./use-confirm";

interface Params {
  /** 미저장 변경이 있는 동안 true. false 면 아무것도 막지 않는다 */
  when: boolean;
  title: string;
  description: string;
  /** 이탈(변경 버리기) 버튼 문구 */
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * 미저장 변경이 있는 화면에서 이탈을 붙잡고 확인 다이얼로그를 띄운다.
 *
 * - **앱 안 이동**(뒤로가기 버튼·사이드바 링크·`navigate`)과 **브라우저/기기 뒤로가기**는
 *   `useBlocker` 가 잡아 `useConfirm` 으로 되묻는다. 취소하면 원래 화면에 그대로 남는다.
 * - **새로고침·탭 닫기**는 라우터 밖이라 붙잡을 수 없다. 브라우저 기본 경고(`beforeunload`)로
 *   대신한다 — 문구는 브라우저가 정하므로 `title`·`description` 이 적용되지 않는다.
 *
 * `useBlocker` 는 **데이터 라우터**(`createBrowserRouter`)에서만 동작한다.
 * `app/routes/app-routes.tsx` 가 그렇게 구성돼 있다.
 */
export const useUnsavedChangesGuard = ({
  when, title, description, confirmLabel = "나가기", cancelLabel = "계속 입력",
}: Params) => {
  const confirm = useConfirm();

  // 같은 화면 안의 이동(쿼리스트링·해시 변경)까지 막으면 필터·탭 조작이 걸린다.
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        when && currentLocation.pathname !== nextLocation.pathname,
      [when],
    ),
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    // 확인 응답을 기다리는 사이 언마운트되면(외부에서 unblock 등) 결과를 버린다.
    let isStale = false;

    void (async () => {
      const isConfirmed = await confirm({
        title, description, confirmLabel, cancelLabel, tone: "danger",
      });
      if (isStale) return;
      if (isConfirmed) blocker.proceed?.();
      else blocker.reset?.();
    })();

    return () => {
      isStale = true;
    };
  }, [blocker, confirm, title, description, confirmLabel, cancelLabel]);

  useBeforeUnload(
    useCallback(
      (event: BeforeUnloadEvent) => {
        if (!when) return;
        event.preventDefault();
      },
      [when],
    ),
  );
};
