import { Button } from "@shared/ui/buttons"
import { Send, X, Trash2 } from "lucide-react";

import { DialogClose, FormDialogShell } from "./FormDialogShell";
import type { DialogSize } from "./dialog-size";

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
  size?: DialogSize;
  /**
   * 미저장 이탈 경고의 판정을 바깥에서 덮어쓴다.
   *
   * 기본값(미지정)은 폼 안에서 `input` 이벤트가 한 번이라도 났는지로 판정하는데,
   * `Select`·`DatePicker` 같은 버튼 기반 컨트롤은 `input` 을 내지 않아 놓칠 수 있다.
   * 정확한 판정이 필요한 폼은 훅에서 계산한 값을 넘긴다.
   */
  isDirty?: boolean;
  /**
   * md 미만에서 화면 전체로 띄운다. 기본값은 기존 동작(중앙 모달) 유지.
   *
   * 좁은 화면에서 좌우 여백까지 빼앗기면 못 쓰게 되는 폼(입력 칸이 많거나 표를 품은 폼)에 켠다.
   * `StepFormDialog` 는 스텝 폼이 늘 그런 부류라 기본값이 켜짐이다.
   */
  fullScreenOnMobile?: boolean;
}

/**
 * 단일 폼 제출 모달.
 *
 * 실수 방지 장치·레이아웃은 `FormDialogShell` 이 소유하고, 여기서는 푸터 버튼만 조립한다.
 * 폼이 길어 단계 분리가 필요하면 `StepFormDialog` 를 쓴다.
 */
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
  fullScreenOnMobile = false,
}: DialogProps) {
  return (
    <FormDialogShell
      triggerLabel={triggerLabel}
      title={title}
      description={description}
      onSubmit={onSubmit}
      open={open}
      onOpenChange={onOpenChange}
      disabled={disabled}
      isDirty={isDirty}
      size={size}
      fullScreenOnMobile={fullScreenOnMobile}
      footer={
        <>
          {deleteLabel && (
            <Button variant="destructive" onClick={onDelete} startIcon={Trash2}>{isLoading ? "삭제 중..." : deleteLabel}</Button>
          )}
          <DialogClose render={<Button variant="outline" startIcon={X}>{cancelLabel}</Button>} />
          {submitLabel && (
            <Button type="submit" disabled={submitDisabled} startIcon={Send}>
              {isLoading ? loadingLabel : submitLabel}
            </Button>
          )}
        </>
      }
    >
      {children}
    </FormDialogShell>
  )
}
