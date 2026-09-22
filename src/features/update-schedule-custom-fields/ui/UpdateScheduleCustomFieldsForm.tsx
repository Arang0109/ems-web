import type { ScheduleCustomField } from "@entities/schedule-custom-field";
import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, InputGroup } from "@shared/ui/form";

import { useUpdateScheduleCustomFields } from "../model/hooks/use-update-schedule-custom-fields";

interface Props {
  scheduleId: number;
  /** 이 고객사의 커스텀 필드 정의 — 칸의 집합과 순서. 비어 있으면 저장할 것이 없다 */
  definitions: ScheduleCustomField[];
  /** 이 회차의 현재 값 — 폼의 초기값 */
  values: Record<string, string> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * 회차 커스텀 필드 값 편집. 칸은 정의 순서(`sortOrder`)대로 그려지고, 저장은 전체 채택이라
 * 비운 칸은 지워진다. 값은 성적서 양식이 `${custom.<key>}` 로 읽는다.
 */
export const UpdateScheduleCustomFieldsForm = ({
  scheduleId, definitions, values, open, onOpenChange, onSuccess,
}: Props) => {
  const { form, fieldErrors, isLoading, handleChange, handleSubmit } = useUpdateScheduleCustomFields({
    scheduleId,
    definitions,
    values,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      title="커스텀 필드 값"
      description="성적서 양식의 ${custom.키} 자리에 들어갈 이 회차의 값입니다. 비운 칸은 빈칸으로 출력됩니다."
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel="닫기"
      submitLabel="저장"
      isLoading={isLoading}
      submitDisabled={definitions.length === 0}
      onSubmit={handleSubmit}
    >
      {definitions.length === 0 ? (
        <p className="text-caption text-muted-foreground">
          정의된 커스텀 필드가 없습니다. 관리자가 관리자 &gt; 커스텀 필드에서 먼저 항목을 정의해야 합니다.
        </p>
      ) : (
        <FieldGroup>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {definitions.map((definition) => (
              <InputGroup
                key={definition.key}
                id={`custom-field-${definition.key}`}
                label={definition.label}
                placeholder={`\${custom.${definition.key}}`}
                value={form[definition.key] ?? ""}
                onChange={(value) => handleChange(definition.key, value)}
                invalid={!!fieldErrors?.[definition.key]}
                error={fieldErrors?.[definition.key]}
                helperText={`양식 이름: custom.${definition.key}`}
              />
            ))}
          </div>
        </FieldGroup>
      )}
    </FormDialog>
  );
};
