import { documentCategoryOptions } from "@shared/model";

import { FieldGroup, InputGroup, SectionTitle, Select, Textarea } from "@shared/ui/form";

import type { DocumentUpdateForm } from "../model/types";

interface Props {
  form: DocumentUpdateForm;
  fieldErrors?: Partial<Record<keyof DocumentUpdateForm, string>>;
  onChange: (name: keyof DocumentUpdateForm, value: string) => void;
}

// 상세 모달이 수정·삭제·버전 이력을 함께 조합하므로 다이얼로그는 widget이 소유하고
// 이 컴포넌트는 수정 대상 필드 묶음만 담당한다.
export const UpdateDocumentFields = ({ form, fieldErrors, onChange }: Props) => (
  <FieldGroup>
    <SectionTitle>기본 정보</SectionTitle>
    <div className="grid md:grid-cols-2 gap-4">
      <InputGroup
        id="name"
        label="문서명"
        placeholder="문서명"
        value={form.name}
        onChange={(value) => onChange('name', value)}
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
        onValueChange={(value) => onChange('category', value ?? '')}
        required
      />
    </div>

    <Textarea
      id="description"
      label="설명"
      placeholder="문서에 대한 설명"
      value={form.description}
      onChange={(value) => onChange('description', value)}
      rows={2}
      maxLength={500}
      // 서버가 blank를 "기존값 유지"로 해석하므로 지우기가 불가능하다는 점을 명시한다.
      helperText={fieldErrors?.description ?? '비워두면 기존 설명이 유지됩니다.'}
    />
  </FieldGroup>
);
