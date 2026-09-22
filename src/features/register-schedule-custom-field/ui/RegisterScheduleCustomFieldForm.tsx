import { useRegisterScheduleCustomField } from "../model/hooks/use-register-schedule-custom-field";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, InputGroup, SectionTitle } from "@shared/ui/form";

// Icon
import { Braces, ListOrdered, Plus, Tag } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * 커스텀 필드 등록.
 *
 * 성적서 템플릿이 `${custom.<key>}` 로 읽을 이름을 만든다. 키는 배포된 양식과 저장된 값의 계약이라
 * 등록 뒤에는 바꿀 수 없다 — 이름을 바꾸려면 삭제 후 다시 등록한다.
 */
export const RegisterScheduleCustomFieldForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const { form, fieldErrors, isLoading, handleChange, handleSubmit } = useRegisterScheduleCustomField({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel={<><Plus />커스텀 필드 등록</>}
      title="커스텀 필드 등록"
      description="성적서(채취기록부) 양식에서 ${custom.키} 로 읽을 항목을 만듭니다. 값은 측정계획마다 따로 입력합니다."
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
      isLoading={isLoading}
    >
      <FieldGroup>
        <SectionTitle>커스텀 필드</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="key"
            label="키 (템플릿 이름)"
            placeholder="예: siteCode"
            value={form.key}
            onChange={(value) => handleChange("key", value)}
            invalid={!!fieldErrors?.key}
            error={fieldErrors?.key}
            helperText={`양식에서 \${custom.${form.key.trim() || "키"}} 로 씁니다. 영문자·숫자·밑줄만, 등록 후 변경 불가.`}
            required
            startIcon={<Braces />}
          />
          <InputGroup
            id="label"
            label="이름 (화면 표시)"
            placeholder="예: 현장 코드"
            value={form.label}
            onChange={(value) => handleChange("label", value)}
            invalid={!!fieldErrors?.label}
            error={fieldErrors?.label}
            helperText="측정계획의 커스텀 필드 입력 칸에 보이는 이름입니다."
            required
            startIcon={<Tag />}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="sortOrder"
            type="number"
            label="표시 순서"
            placeholder="비우면 맨 뒤"
            value={form.sortOrder}
            onChange={(value) => handleChange("sortOrder", value)}
            min={0}
            maxDecimals={0}
            invalid={!!fieldErrors?.sortOrder}
            error={fieldErrors?.sortOrder}
            helperText="작은 수가 먼저 옵니다. 비우면 목록 맨 뒤에 붙습니다."
            startIcon={<ListOrdered />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
