import { FormDialog } from "@shared/ui/dialogs";
import { Textarea } from "@shared/ui/form";

import { REASON_MAX_LENGTH } from "../model/validator";
import type { ReasonDialogState } from "../model/hooks/use-reason-dialog";

interface Props {
  state: ReasonDialogState;
  title: string;
  description: string;
  label: string;
  placeholder: string;
  submitLabel: string;
  loadingLabel: string;
  isLoading: boolean;
}

/**
 * 사유를 받아 확정하는 다이얼로그. 취소와 재개방이 같은 형태라 공유한다.
 * 사유는 서버에서 필수이므로 빈 값이면 제출 버튼을 막고 문구를 띄운다.
 */
export const ReasonDialog = ({
  state, title, description, label, placeholder, submitLabel, loadingLabel, isLoading,
}: Props) => (
  <FormDialog
    open={state.isOpen}
    onOpenChange={state.setOpen}
    title={title}
    description={description}
    onSubmit={state.submit}
    submitLabel={submitLabel}
    loadingLabel={loadingLabel}
    isLoading={isLoading}
    submitDisabled={isLoading || !state.reason.trim()}
    // 사유 한 줄이 전부라 미저장 이탈 경고는 입력이 있을 때만 띄운다.
    isDirty={state.reason.length > 0}
  >
    <Textarea
      id="schedule-lifecycle-reason"
      label={label}
      value={state.reason}
      onChange={state.setReason}
      placeholder={placeholder}
      rows={4}
      required
      maxLength={REASON_MAX_LENGTH}
      helperText={state.error ?? "입력한 사유는 상태 변경 이력에 그대로 기록됩니다."}
    />
  </FormDialog>
);
