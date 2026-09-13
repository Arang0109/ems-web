import type { ChatMessage } from "@entities/chat";

/**
 * 대화 화면에 실제로 그려지는 항목.
 *
 * 메시지 배열을 그대로 렌더하지 않는 이유는 **일자 구분선과 "여기부터 안 읽음" 표시가
 * 메시지 사이에 끼어들기** 때문이다. 그것을 렌더링 중에 계산하면 조건문이 JSX 에 흩어지고
 * 테스트할 수도 없다. 여기서 한 번에 펴 둔다.
 */
export type ChatTimelineEntry =
  | { kind: "day"; key: string; label: string }
  | { kind: "unread-divider"; key: string }
  | {
      kind: "message";
      key: string;
      message: ChatMessage;
      /** 내가 보낸 것 — 오른쪽에 붙는다 */
      isMine: boolean;
      /** `'오후 2:30'` */
      timeLabel: string;
      /** 내 메시지가 상대에게 읽혔는지. 상대 메시지에는 의미가 없다 */
      isRead: boolean;
      /**
       * 시각을 표시할지. 같은 사람이 같은 분에 연달아 보내면 마지막 줄에만 적는다 —
       * 줄마다 같은 시각이 반복되면 본문보다 눈에 띈다.
       */
      showTime: boolean;
      /** 말풍선 묶음의 첫 줄인지 — 위쪽 여백이 갈린다 */
      isGroupStart: boolean;
    };
