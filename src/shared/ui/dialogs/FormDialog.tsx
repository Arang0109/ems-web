import { Button } from "@/components/ui/button"
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

// 모달 너비 프리셋
const SIZE_CLASS = {
  default: "sm:max-w-150",  // 600px
  lg: "sm:max-w-3xl",       // 768px
  xl: "sm:max-w-5xl",       // 1024px
} as const;

interface DialogProps {
  triggerLabel?: string;
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
  isLoading?: boolean;
  size?: keyof typeof SIZE_CLASS;
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
  isLoading,
  size = "default",
}: DialogProps) {
  return (
    <DialogPrimitive open={open} onOpenChange={onOpenChange}>
      {triggerLabel && (
        <DialogTrigger disabled={disabled} render={<Button variant="outline">{triggerLabel}</Button>} />
      )}
      <DialogContent className={cn(SIZE_CLASS[size], "flex max-h-[90vh] flex-col")}>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
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
              <Button variant="destructive" onClick={onDelete}>{isLoading ? "삭제 중..." : deleteLabel}</Button>
            )}
            <DialogClose render={<Button variant="outline">{cancelLabel}</Button>} />
            {submitLabel && <Button type="submit">{isLoading ? "제출 중..." : submitLabel}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogPrimitive>
  )
}