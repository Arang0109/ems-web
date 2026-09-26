import { toast as sonner } from 'sonner';

const toast = Object.assign(
  (message: string) => sonner(message),
  {
    success: (message: string) => sonner.success(message),
    error: (message: string) => sonner.error(message),
    info: (message: string) => sonner.info(message),
    warning: (message: string) => sonner.warning(message),
    promise: sonner.promise,
    /** 사용자가 버튼을 누르거나 닫을 때까지 남는 안내 — 예: 새 버전 적용 */
    prompt: (message: string, action: { label: string; onClick: () => void }) =>
      sonner.info(message, { duration: Infinity, action }),
  },
);

export { toast };
