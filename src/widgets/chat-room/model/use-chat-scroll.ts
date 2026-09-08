import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** 이 안쪽이면 "바닥을 보고 있다"고 친다 — 픽셀 단위로 딱 맞추면 소수점 오차에 걸린다 */
const BOTTOM_THRESHOLD_PX = 48;

/** 센티넬이 화면에 들어오기 조금 전에 미리 받아 둔다 */
const PREFETCH_MARGIN_PX = 200;

interface Props {
  /** 타임라인 길이. 이 값이 바뀌는 것이 곧 "무언가 붙었다"는 신호다 */
  messageCount: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
}

/**
 * 대화 스크롤 — 바닥 고정, 위로 읽어 올리기, 새 메시지 알림.
 *
 * **`flex-col-reverse` 트릭을 쓰지 않는다.** 스크롤 고정은 공짜로 얻지만 DOM 순서가
 * 뒤집혀 일자 구분선이 아래에 붙고, 텍스트 선택과 키보드 순회가 눈에 보이는 순서와
 * 어긋난다. 정순으로 그리고 스크롤을 직접 관리하는 편이 낫다.
 *
 * **방이 바뀔 때의 초기화는 여기서 하지 않는다.** 호출부가 `key={roomId}` 로 리마운트하므로
 * 모든 ref 와 state 가 초기값에서 다시 시작한다 — 스크롤 위치·바닥 여부·최초 점프 여부를
 * 손으로 되돌리면 그 목록이 길어질수록 빠뜨리기 쉽다.
 */
export const useChatScroll = ({ messageCount, hasMore, isLoadingMore, loadMore }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  /** 바닥에서 떨어져 있는 동안 새 메시지가 왔다 */
  const [hasNewBelow, setHasNewBelow] = useState(false);

  /** 과거를 더 받기 직전의 스크롤 높이. 붙은 뒤 그만큼 되밀어 준다 */
  const heightBeforeLoadRef = useRef<number | null>(null);
  const previousCountRef = useRef(0);
  /** 첫 진입에 한 번만 바닥으로 점프한다 */
  const didInitialJumpRef = useRef(false);
  const isAtBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    setHasNewBelow(false);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom <= BOTTOM_THRESHOLD_PX;

    isAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
    if (atBottom) setHasNewBelow(false);
  }, []);

  /**
   * 길이가 바뀐 뒤 **페인트 전에** 위치를 잡는다.
   *
   * `useEffect` 로 미루면 브라우저가 보정 전 프레임을 한 번 그려서 화면이 튄다.
   */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || messageCount === 0) return;

    const grew = messageCount - previousCountRef.current;
    previousCountRef.current = messageCount;

    // ① 방에 처음 들어왔다 — 애니메이션 없이 바닥으로
    if (!didInitialJumpRef.current) {
      didInitialJumpRef.current = true;
      el.scrollTop = el.scrollHeight;
      return;
    }

    // ② 위에 과거가 붙었다 — 늘어난 높이만큼 내려 보던 자리를 유지한다
    const heightBefore = heightBeforeLoadRef.current;
    if (heightBefore !== null) {
      heightBeforeLoadRef.current = null;
      el.scrollTop += el.scrollHeight - heightBefore;
      return;
    }

    // ③ 아래에 새 메시지가 붙었다
    if (grew > 0) {
      if (isAtBottomRef.current) {
        el.scrollTop = el.scrollHeight;
      } else {
        setHasNewBelow(true);
      }
    }
  }, [messageCount]);

  // 위쪽 센티넬이 보이면 과거를 더 받는다
  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = topSentinelRef.current;
    if (!root || !sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isLoadingMore) return;
        // 붙은 뒤 보정에 쓸 기준 높이를 요청 직전에 기록한다
        heightBeforeLoadRef.current = root.scrollHeight;
        loadMore();
      },
      { root, rootMargin: `${PREFETCH_MARGIN_PX}px 0px 0px 0px` },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  return {
    scrollRef,
    topSentinelRef,
    handleScroll,
    /** 바닥을 보고 있는지 — 읽음 보고 조건이기도 하다 */
    isAtBottom,
    /** 바닥에서 떨어진 채 새 메시지를 받았다 */
    hasNewBelow,
    scrollToBottom,
  };
};
