/** 대화 목록 한 줄의 표시용 값 — 포맷이 끝난 상태다 */
export type ChatRoomListRow = {
  roomId: number;
  /** 상대 이름. 삭제된 계정이면 대체 문구가 들어 있다 */
  peerName: string;
  department: string;
  online: boolean;
  /** 마지막 메시지 미리보기. 대화가 없으면 안내 문구 */
  preview: string;
  /** `'방금 전'`·`'오후 2:30'`·`'9월 6일'`. 대화가 없으면 빈 문자열 */
  timeLabel: string;
  unreadCount: number;
};
