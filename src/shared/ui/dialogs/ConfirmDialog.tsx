import { AlertDialog } from "@base-ui/react/alert-dialog";
import { TriangleAlert } from "lucide-react";

import { Button } from "@shared/ui/buttons";

import type { ConfirmOptions } from "./confirm-context";

interface Props {
  open: boolean;
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 확인 다이얼로그의 표시 전용 컴포넌트. 상태는 `ConfirmProvider` 가 갖는다.
 *
 * `Dialog` 가 아니라 `AlertDialog` 를 쓰는 이유 — 바깥 클릭으로 닫히지 않고
 * role/aria 가 "확인을 강제하는 다이얼로그"에 맞다.
 */
export const ConfirmDialog = ({ open, options, onConfirm, onCancel }: Props) => {
  const isDanger = options?.tone === "danger";

  return (
    <AlertDialog.Root open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 dark:bg-black/50" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 flex w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-dialog bg-surface p-6 text-ink ring-1 ring-rule duration-100 outline-none sm:max-w-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="flex gap-3">
            {isDanger && (
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-danger" />
            )}
            <div className="flex flex-col gap-2">
              <AlertDialog.Title className="font-heading text-body-1 leading-none">
                {options?.title}
              </AlertDialog.Title>
              {options?.description && (
                <AlertDialog.Description className="text-body-3 whitespace-pre-line text-muted-ink">
                  {options.description}
                </AlertDialog.Description>
              )}
            </div>
          </div>

          {/* 취소가 DOM 상 먼저라 열릴 때 기본 포커스를 받는다 — 엔터 연타로 확정되지 않게 한다 */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onCancel}>
              {options?.cancelLabel ?? "취소"}
            </Button>
            <Button
              variant={isDanger ? "destructive" : "default"}
              onClick={onConfirm}
            >
              {options?.confirmLabel ?? "확인"}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
