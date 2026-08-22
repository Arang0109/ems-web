/** 서버 @Size(max = 500) 과 같은 한도. 넘기면 400이 되므로 화면에서 먼저 막는다. */
export const REASON_MAX_LENGTH = 500;

/**
 * 취소·재개방 사유 검증. 서버가 @NotBlank 로 필수를 강제하므로 공백만 입력한 경우도 거른다.
 * 통과하면 null, 실패하면 표시할 문구를 반환한다.
 */
export const validateReason = (reason: string): string | null => {
  if (!reason.trim()) return "사유를 입력해 주세요.";
  if (reason.length > REASON_MAX_LENGTH) return `사유는 ${REASON_MAX_LENGTH}자를 넘을 수 없습니다.`;
  return null;
};
