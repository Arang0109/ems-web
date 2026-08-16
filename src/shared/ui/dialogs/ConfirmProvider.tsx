import { useCallback, useRef, useState } from "react";

import { ConfirmContext, type ConfirmOptions } from "./confirm-context";
import { ConfirmDialog } from "./ConfirmDialog";

/**
 * 앱 전역 확인 다이얼로그. `app-provider` 에서 한 번만 렌더한다.
 * 실제 호출은 `@shared/ui/dialogs` 의 `useConfirm` 을 쓴다.
 */
export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);

  // 열려 있는 동안 대기 중인 Promise 의 resolve. 렌더와 무관하므로 ref 로 든다.
  const resolveRef = useRef<((result: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    // 앞선 요청이 남아 있으면 취소로 정리한다 (Promise 가 영원히 대기하지 않도록).
    resolveRef.current?.(false);

    setOptions(next);
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  // options 는 지우지 않는다 — 닫힘 애니메이션 도중 문구가 사라지지 않게 한다.
  const settle = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={open}
        options={options}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
};
