/** 방에 들어온 시점 기준으로 "여기부터 안 읽음" 을 표시한다 */
export const ChatUnreadDivider = () => (
  <div className="flex items-center gap-2 py-3" role="separator" aria-label="여기부터 읽지 않음">
    <span className="h-px flex-1 bg-brand-primary/40" />
    <span className="text-caption text-brand-dark">여기부터 읽지 않음</span>
    <span className="h-px flex-1 bg-brand-primary/40" />
  </div>
);
