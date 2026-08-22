import { format } from "date-fns";

import type { InspectionRecordForm } from "../model/types";

import { InputGroup, Select, DatePicker, Textarea, SectionTitle } from "@shared/ui/form";
import { inspectionResultOptions } from "@shared/model";

interface Props {
  form: InspectionRecordForm;
  fieldErrors?: Partial<Record<keyof InspectionRecordForm, string>>;
  onChange: (name: keyof InspectionRecordForm, value: string) => void;
}

export const RecordInspectionFields = ({ form, fieldErrors, onChange }: Props) => (
  <div className="space-y-4">
    <SectionTitle>검사 실시 기록</SectionTitle>

    <div className="grid md:grid-cols-2 gap-4">
      <DatePicker
        id="inspectedAt"
        label="검사 실시일"
        value={form.inspectedAt ? new Date(form.inspectedAt) : undefined}
        onChange={(date) => onChange('inspectedAt', date ? format(date, 'yyyy-MM-dd') : '')}
        required
        helperText={fieldErrors?.inspectedAt}
      />
      <DatePicker
        id="validUntil"
        label="유효기간 만료일"
        value={form.validUntil ? new Date(form.validUntil) : undefined}
        onChange={(date) => onChange('validUntil', date ? format(date, 'yyyy-MM-dd') : '')}
        helperText={fieldErrors?.validUntil ?? '성적서에 만료일이 적혀 있으면 입력하세요. 다음 예정일로 지정됩니다.'}
      />
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      <InputGroup id="agency" label="검사기관" placeholder="검사·교정 기관"
        value={form.agency} onChange={(v) => onChange('agency', v)} />
      <InputGroup id="certificateNumber" label="성적서 번호" placeholder="성적서 번호"
        value={form.certificateNumber} onChange={(v) => onChange('certificateNumber', v)} />
      <Select
        id="result"
        label="판정"
        placeholder="판정 선택"
        options={inspectionResultOptions}
        value={form.result}
        onValueChange={(v) => onChange('result', v ?? '')}
      />
    </div>

    <Textarea id="remark" label="비고" placeholder="비고"
      value={form.remark} onChange={(v) => onChange('remark', v)} rows={2} />
  </div>
);
