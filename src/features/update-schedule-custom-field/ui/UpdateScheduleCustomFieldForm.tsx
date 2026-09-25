import { Braces, ListOrdered, Tag } from "lucide-react";

import { useUpdateScheduleCustomField } from "../model/hooks/use-update-schedule-custom-field";
import { useDeleteScheduleCustomField } from "../model/hooks/use-delete-schedule-custom-field";

import type { ScheduleCustomField } from "@entities/schedule-custom-field";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, InputGroup, SectionTitle } from "@shared/ui/form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: ScheduleCustomField | null;
  onSuccess?: () => void;
}

/**
 * 커스텀 필드 상세 편집. 키는 읽기 전용으로만 보인다 — 배포된 양식이 `${custom.<key>}` 로 참조하고
 * 회차 값이 그 키로 저장돼 있어, 바꾸면 둘 다 고아가 된다. 이름을 바꾸려면 삭제 후 다시 등록한다.
 */
export const UpdateScheduleCustomFieldForm = ({ open, onOpenChange, field, onSuccess }: Props) => {
  const close = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const { form, fieldErrors, isLoading: isUpdating, handleChange, handleSubmit } =
    useUpdateScheduleCustomField({ field, onSuccess: close });

  const { isLoading: isDeleting, handleDelete } =
    useDeleteScheduleCustomField({ field, onSuccess: close });

  if (!field) return;

  return (
    <FormDialog
      title="커스텀 필드 상세"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      submitLabel="수정"
      deleteLabel="삭제"
      cancelLabel="닫기"
      isLoading={isUpdating || isDeleting}
    >
      <FieldGroup>
        <SectionTitle>커스텀 필드</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="key"
            label="키 (템플릿 이름)"
            value={field.key}
            onChange={() => undefined}
            disabled
            helperText={`양식에서 \${custom.${field.key}} 로 씁니다. 등록 후에는 바꿀 수 없습니다.`}
            startIcon={<Braces />}
          />
          <InputGroup
            id="label"
            label="이름 (화면 표시)"
            placeholder="예: 현장 코드"
            value={form.label}
            onChange={(value) => handleChange("label", value)}
            errorMessage={fieldErrors?.label}
            required
            startIcon={<Tag />}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="sortOrder"
            type="number"
            label="표시 순서"
            placeholder="비우면 유지"
            value={form.sortOrder}
            onChange={(value) => handleChange("sortOrder", value)}
            min={0}
            maxDecimals={0}
            errorMessage={fieldErrors?.sortOrder}
            helperText="작은 수가 먼저 옵니다."
            startIcon={<ListOrdered />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
