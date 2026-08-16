import { useState } from "react"
import type { Dialog as BaseDialog } from "@base-ui/react/dialog"

import { Button } from "@shared/ui/buttons"
import {
  Dialog as DialogPrimitive,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Send, X, Trash2 } from "lucide-react";

import { useConfirm } from "./use-confirm";

// 모달 너비 프리셋
const SIZE_CLASS = {
  default: "sm:max-w-150",  // 600px
  lg: "sm:max-w-3xl",       // 768px
  xl: "sm:max-w-5xl",       // 1024px
} as const;

interface DialogProps {
  triggerLabel?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  submitLabel?: string;
  deleteLabel?: string;
  cancelLabel?: string;
  onSubmit?: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  submitDisabled?: boolean;   // 제출 버튼 비활성 (disabled는 트리거 버튼용이라 분리)
  loadingLabel?: string;      // 로딩 중 제출 버튼 문구. 기본 "제출 중..."
  isLoading?: boolean;
  size?: keyof typeof SIZE_CLASS;
  /**
   * 미저장 이탈 경고의 판정을 바깥에서 덮어쓴다.
   *
   * 기본값(미지정)은 폼 안에서 `input` 이벤트가 한 번이라도 났는지로 판정하는데,
   * `Select`·`DatePicker` 같은 버튼 기반 컨트롤은 `input` 을 내지 않아 놓칠 수 있다.
   * 정확한 판정이 필요한 폼은 훅에서 계산한 값을 넘긴다.
   */
  isDirty?: boolean;
}

export function FormDialog({
  triggerLabel,
  title,
  description,
  children,
  submitLabel='제출',
  deleteLabel,
  cancelLabel='닫기',
  onSubmit,
  onDelete,
  open,
  onOpenChange,
  disabled,
  submitDisabled,
  loadingLabel = '제출 중...',
  isLoading,
  size = "default",
  isDirty,
}: DialogProps) {
  const confirm = useConfirm();

  // 폼 안에서 입력이 한 번이라도 났는지. 열릴 때마다 초기화한다.
  const [isTouched, setIsTouched] = useState(false);

  // 열림 전환에 맞춰 렌더 중 초기화한다 — effect + setState 는 cascading render 를 부른다.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIsTouched(false);
  }

  /**
   * 입력 중 엔터로 폼이 제출되는 사고를 막는다 (브라우저의 암묵적 제출).
   *
   * 제출은 버튼을 눌렀을 때만 일어난다 — 마우스 클릭, 또는 버튼에 포커스를 둔 상태의
   * 엔터·스페이스(둘 다 네이티브 click 을 낸다). 키보드만으로도 제출은 가능하되
   * 입력란에서 엔터를 연타하는 것만으로는 제출되지 않는다.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;

    const target = e.target as HTMLElement;
    // textarea 는 줄바꿈이 본래 동작이고, 버튼은 클릭으로 이어져야 한다.
    if (target.tagName === "TEXTAREA" || target.closest("button")) return;

    e.preventDefault();
  };

  const handleOpenChange = async (
    next: boolean,
    details: BaseDialog.Root.ChangeEventDetails,
  ) => {
    if (next) {
      setIsTouched(false);
      onOpenChange?.(true);
      return;
    }

    if (!(isDirty ?? isTouched)) {
      onOpenChange?.(false);
      return;
    }

    // Base UI 내부 닫기를 먼저 막고(await 이전이어야 한다) 확인을 받는다.
    details.cancel();

    const isConfirmed = await confirm({
      title: "작성 중인 내용이 있습니다",
      description: "닫으면 입력한 내용이 사라집니다.",
      confirmLabel: "닫기",
      tone: "danger",
    });
    if (isConfirmed) onOpenChange?.(false);
  };

  return (
    // 배경 클릭 한 번에 작성 중인 폼이 사라지지 않도록 Base UI 기본값(닫힘)을 끈다.
    <DialogPrimitive open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      {triggerLabel && (
        <DialogTrigger disabled={disabled} render={<Button variant="default">{triggerLabel}</Button>} />
      )}
      <DialogContent className={cn(SIZE_CLASS[size], "flex max-h-[90vh] flex-col")}>
        <form
          onSubmit={onSubmit}
          onInput={() => setIsTouched(true)}
          onKeyDown={handleKeyDown}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader className="mb-5 shrink-0">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {/* 내용이 길면 이 영역만 스크롤되어 헤더/푸터가 잘리지 않는다 */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {children}
          </div>
          <DialogFooter className="mt-5 shrink-0">
            {deleteLabel && (
              <Button variant="destructive" onClick={onDelete} startIcon={Trash2}>{isLoading ? "삭제 중..." : deleteLabel}</Button>
            )}
            <DialogClose render={<Button variant="outline" startIcon={X}>{cancelLabel}</Button>} />
            {submitLabel && (
              <Button type="submit" disabled={submitDisabled} startIcon={Send}>
                {isLoading ? loadingLabel : submitLabel}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogPrimitive>
  )
}