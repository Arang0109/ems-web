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
}: DialogProps) {
  return (
    <DialogPrimitive open={open} onOpenChange={onOpenChange}>
      <DialogTrigger disabled={disabled} render={<Button variant="outline">{triggerLabel}</Button>} />
      <DialogContent className="sm:max-w-150">
        <form onSubmit={onSubmit}>
          <DialogHeader className="mb-5">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter className="mt-5">
            {deleteLabel && (
              <Button variant="destructive" onClick={onDelete}>{deleteLabel}</Button>
            )}
            <DialogClose render={<Button variant="outline">{cancelLabel}</Button>} />
            {submitLabel && <Button type="submit">{submitLabel}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogPrimitive>
  )
}