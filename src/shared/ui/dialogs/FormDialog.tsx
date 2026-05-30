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
  triggerLabel: string;
  title: string;
  description: string;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: (e: React.FormEvent) => void;

  disabled?: boolean;
}

export function FormDialog({
  triggerLabel,
  title,
  description,
  children,
  submitLabel='제출',
  cancelLabel='닫기',

  onSubmit,

  disabled,
}: DialogProps) {
  return (
    <DialogPrimitive>
      <DialogTrigger disabled={disabled} render={<Button variant="outline">{triggerLabel}</Button>} />
      <DialogContent className="sm:max-w-150">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter className="mt-3">
            <DialogClose render={<Button variant="outline">{cancelLabel}</Button>} />
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogPrimitive>
  )
}