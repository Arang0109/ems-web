import { documentCategoryOptions } from "@entities/document";

import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, FileInput, InputGroup, SectionTitle, Select, Textarea } from "@shared/ui/form";

import { useRegisterDocument } from "../model/hooks/use-register-document";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 활성 탭의 분류를 기본 선택한다. */
  defaultCategory?: string;
  onSuccess?: () => void;
}

export const RegisterDocumentForm = ({ open, onOpenChange, defaultCategory, onSuccess }: Props) => {
  const {
    form,
    isLoading,
    fieldErrors,
    handleChange,
    handleFileChange,
    handleSubmit,
  } = useRegisterDocument({
    defaultCategory,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel="문서 등록"
      title="문서 등록"
      description="문서와 첫 번째 버전의 파일을 함께 등록합니다."
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
      isLoading={isLoading}
    >
      <FieldGroup>
        <SectionTitle>기본 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="name"
            label="문서명"
            placeholder="문서명"
            value={form.name}
            onChange={(value) => handleChange('name', value)}
            invalid={!!fieldErrors?.name}
            error={fieldErrors?.name}
            required
          />
          <Select
            id="category"
            label="문서 분류"
            placeholder="문서 분류 선택"
            options={documentCategoryOptions}
            value={form.category}
            onValueChange={(value) => handleChange('category', value ?? '')}
            required
          />
        </div>

        <Textarea
          id="description"
          label="설명"
          placeholder="문서에 대한 설명"
          value={form.description}
          onChange={(value) => handleChange('description', value)}
          rows={2}
          maxLength={500}
          helperText={fieldErrors?.description}
        />

        <Divider />

        <SectionTitle>파일</SectionTitle>
        <FileInput
          id="file"
          label="문서 파일"
          file={form.file}
          onChange={handleFileChange}
          isInvalid={!!fieldErrors?.file}
          helperText={fieldErrors?.file ?? '20MB 이하의 파일을 등록할 수 있습니다.'}
          required
        />
        <Textarea
          id="changeNote"
          label="변경 사유"
          placeholder="최초 등록"
          value={form.changeNote}
          onChange={(value) => handleChange('changeNote', value)}
          rows={2}
          maxLength={500}
          helperText={fieldErrors?.changeNote}
        />
      </FieldGroup>
    </FormDialog>
  );
};
