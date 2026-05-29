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
}

export function FormDialog({
  triggerLabel,
  title,
  description,
  children,
  submitLabel='제출',
  cancelLabel='닫기',

  onSubmit,
}: DialogProps) {
  return (
    <DialogPrimitive>
      <form>
        <DialogTrigger render={<Button variant="outline">{triggerLabel}</Button>} />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
          <DialogFooter>
            <DialogClose render={<Button variant="outline">{cancelLabel}</Button>} />
            <Button type="submit" onSubmit={onSubmit}>{submitLabel}</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </DialogPrimitive>
  )
}