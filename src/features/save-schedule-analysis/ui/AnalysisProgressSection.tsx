import { format } from "date-fns";
import { Save } from "lucide-react";

import { SectionAccordion } from "@shared/ui/accordion";
import { Button } from "@shared/ui/buttons";
import { DatePicker, InputGroup } from "@shared/ui/form";

import type { AnalysisProgressForm } from "../model/types";

interface Props {
  form: AnalysisProgressForm;
  editable: boolean;
  isDirty: boolean;
  isLoading: boolean;
  /** 아직 '분석값입력중'으로 넘어가지 않았는지 — 시료접수일자 안내를 띄울지 판단한다 */
  isBeforeAnalyzing: boolean;
  onChange: (name: keyof AnalysisProgressForm, value: string) => void;
  onSave: () => void;
}

const toDate = (value: string): Date | undefined => (value ? new Date(value) : undefined);
const toDateValue = (date: Date | undefined): string => (date ? format(date, "yyyy-MM-dd") : "");

/**
 * 분석 진행 정보. 시료가 실험실에 들어온 시점부터 성적서 발행까지의 일자와 담당자를 다룬다.
 *
 * 시료접수일자를 저장하면 계획이 '분석값입력중'으로 전진하고, 그때부터 성적서 작성 완료를 확정할 수 있다.
 */
export const AnalysisProgressSection = ({
  form, editable, isDirty, isLoading, isBeforeAnalyzing, onChange, onSave,
}: Props) => (
  <SectionAccordion
    title="분석 진행"
    description="시료 접수·분석 완료 일자와 분석 담당자를 입력합니다."
    defaultOpen
  >
    {isBeforeAnalyzing && (
      <p className="rounded-panel bg-brand-soft px-3 py-2 text-body-3 text-brand-dark">
        시료접수일자를 저장하면 측정계획이 <b>분석값입력중</b>으로 넘어가고, 그때부터 성적서 작성 완료를 확정할 수 있습니다.
      </p>
    )}

    <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-3">
      <DatePicker
        id="receivedAt"
        label="시료접수일자"
        value={toDate(form.receivedAt)}
        disabled={!editable}
        onChange={(date) => onChange("receivedAt", toDateValue(date))}
      />
      <DatePicker
        id="analyzedAt"
        label="분석완료일자"
        value={toDate(form.analyzedAt)}
        disabled={!editable}
        onChange={(date) => onChange("analyzedAt", toDateValue(date))}
      />
      <DatePicker
        id="issuedAt"
        label="성적서발행일자"
        value={toDate(form.issuedAt)}
        disabled={!editable}
        onChange={(date) => onChange("issuedAt", toDateValue(date))}
      />
      <InputGroup
        id="analyst"
        label="시료분석검사자"
        value={form.analyst}
        disabled={!editable}
        onChange={(value) => onChange("analyst", value)}
      />
      <InputGroup
        id="technicalManager"
        label="기술책임자"
        value={form.technicalManager}
        disabled={!editable}
        onChange={(value) => onChange("technicalManager", value)}
      />
    </div>

    {editable && (
      <div className="flex justify-end">
        <Button size="sm" startIcon={Save} onClick={onSave} disabled={!isDirty || isLoading}>
          {isLoading ? "저장 중..." : "진행 정보 저장"}
        </Button>
      </div>
    )}
  </SectionAccordion>
);
