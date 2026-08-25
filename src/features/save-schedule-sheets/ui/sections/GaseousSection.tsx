import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { SectionAccordion } from "@shared/ui/accordion";
import { Button, IconButton } from "@shared/ui/buttons";
import { FormDialog } from "@shared/ui/dialogs";
import { UnitField } from "@shared/ui/form";
import { InputTable, type InputTableColumn } from "@shared/ui/table";

import { GAS_SAMPLE_HINT } from "../../model/field-hints";
import { REQUIRED_SAMPLE_FIELDS, fieldPath } from "../../model/required-fields";
import type { SampleForm } from "../../model/types";
import type { FieldStateProps, SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps, FieldStateProps {
  samples: SampleForm[];
  editable: boolean;
  onSampleChange: (index: number, patch: Partial<SampleForm>) => void;
  onAddSample: () => void;
  onRemoveSample: (index: number) => void;
}

interface GasField {
  field: keyof SampleForm;
  label: string;
  unit?: string;
  type: "text" | "time" | "number";
  step?: number;
  /** 음수가 성립하지 않는 항목(무게·부피·유량)에만 준다 — `NumericField` 의 ± 버튼이 빠진다 */
  min?: number;
  /** 데스크탑 표의 열 폭 (px) — 표는 가로 스크롤이므로 항목별로 다르게 준다 */
  width: number;
  hint?: string;
}

/** 필수 별표는 손으로 적지 않는다 — 저장 검증·진행도 배지와 같은 목록에서 파생시킨다 */
const isRequired = (field: keyof SampleForm): boolean => REQUIRED_SAMPLE_FIELDS.includes(field);

/**
 * 입력 순서 = 현장 기록지의 기입 순서.
 * 항목명 → 채취시간 → 흡인 조건 → 채취량·적산값 → 시료번호.
 */
const GAS_FIELDS: GasField[] = [
  { field: "sampleName", label: "항목명", type: "text", width: 140, hint: GAS_SAMPLE_HINT.sampleName },
  { field: "startTime", label: "채취 시작", type: "time", width: 110 },
  { field: "endTime", label: "채취 종료", type: "time", width: 110 },
  {
    field: "suctionQuantity", label: "흡인유량", unit: "L/min", type: "number", min: 0, step: 0.1,
    width: 110, hint: GAS_SAMPLE_HINT.suctionQuantity,
  },
  {
    field: "gasMeterGaugePressure", label: "가스미터압", unit: "mmH₂O", type: "number", step: 0.1,
    width: 120, hint: GAS_SAMPLE_HINT.gasMeterGaugePressure,
  },
  {
    field: "inTemperature", label: "가스미터온도 (입구)", unit: "°C", type: "number", step: 0.1,
    width: 130, hint: GAS_SAMPLE_HINT.gasMeterTemperature,
  },
  {
    field: "outTemperature", label: "가스미터온도 (출구)", unit: "°C", type: "number", step: 0.1,
    width: 130, hint: GAS_SAMPLE_HINT.gasMeterTemperature,
  },
  {
    field: "samplingVolume", label: "시료채취량", unit: "L", type: "number", min: 0, step: 0.1,
    width: 120, hint: GAS_SAMPLE_HINT.samplingVolume,
  },
  {
    field: "beforeVolume", label: "채취 전 적산값", unit: "L", type: "number", min: 0, step: 0.01,
    width: 130, hint: GAS_SAMPLE_HINT.volume,
  },
  {
    field: "afterVolume", label: "채취 후 적산값", unit: "L", type: "number", min: 0, step: 0.01,
    width: 130, hint: GAS_SAMPLE_HINT.volume,
  },
  { field: "sampleNumber", label: "본시료", type: "text", width: 120, hint: GAS_SAMPLE_HINT.sampleNumber },
  { field: "blankSampleNumber", label: "바탕시료", type: "text", width: 120, hint: GAS_SAMPLE_HINT.blankSampleNumber },
];

const ROW_LABEL_WIDTH = 48;
const ACTION_WIDTH = 44;

const titleOf = (sample: SampleForm, index: number): string =>
  sample.sampleName.trim() || `항목 #${index + 1}`;

/** 카드 부제 — 채취시간과 본시료번호를 한 줄로 요약한다 */
const subtitleOf = (sample: SampleForm): string => {
  const time = sample.startTime && sample.endTime
    ? `${sample.startTime} ~ ${sample.endTime}` : sample.startTime || "시간 미입력";
  return sample.sampleNumber.trim() ? `${time} · ${sample.sampleNumber.trim()}` : time;
};

/**
 * 가스상 물질 채취 정보.
 *
 * 기록지(시트)마다 존재하며 입자상·가스상 카테고리를 가리지 않는다.
 * 표현은 폭에 따라 갈린다 — 데스크탑은 행=항목인 표에서 바로 편집하고,
 * 모바일은 제목만 보이는 카드를 눌러 모달에서 고친다(칸이 12개라 카드에 펼치면 읽히지 않는다).
 */
export const GaseousSection = ({
  samples, editable, onSampleChange, onAddSample, onRemoveSample,
  fieldTone, onFieldFocus, ...shell
}: Props) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const editingSample = editingIndex == null ? null : samples[editingIndex] ?? null;

  const columns: InputTableColumn<SampleForm>[] = [
    { kind: "label", header: "No.", width: ROW_LABEL_WIDTH, render: (_, index) => index + 1 },

    ...GAS_FIELDS.map((f): InputTableColumn<SampleForm> => ({
      kind: "input",
      // 모바일 모달의 `required` 별표와 같은 표시를 데스크탑 표 머리에도 준다
      header: (
        <>
          {f.unit ? `${f.label} (${f.unit})` : f.label}
          {isRequired(f.field) && <span className="text-danger">*</span>}
        </>
      ),
      hintLabel: `${f.label} 설명`,
      hint: f.hint,
      width: f.width,
      type: f.type,
      min: f.min,
      step: f.step,
      value: (sample) => sample[f.field],
      tone: (_, index) => fieldTone(fieldPath.sample(index, f.field)),
      onFocus: (_, index) => onFieldFocus(fieldPath.sample(index, f.field)),
      onChange: (_, v, index) => onSampleChange(index, { [f.field]: v }),
    })),

    {
      kind: "action", header: "삭제", width: ACTION_WIDTH,
      render: (sample, index) => (
        <IconButton
          variant="ghost" size="icon-sm" label={`${titleOf(sample, index)} 삭제`}
          icon={<Trash2 size={16} />}
          onClick={() => onRemoveSample(index)}
        />
      ),
    },
  ];

  const addButton = editable ? (
    <Button type="button" variant="outline" size="sm" onClick={onAddSample}>
      <Plus size={14} />항목 추가
    </Button>
  ) : null;

  return (
    <SectionAccordion
      {...shell}
      title="가스상 물질"
      subtitle="항목별 시료채취 정보를 입력합니다."
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-3 text-muted-ink">채취 항목 {samples.length}건</span>
        {addButton}
      </div>

      {samples.length === 0 ? (
        <p className="text-body-3 text-muted-ink">등록된 채취 항목이 없습니다.</p>
      ) : (
        <>
          {/* 모바일 — 제목만 보이는 카드. 누르면 모달에서 편집한다. */}
          <div className="space-y-3 md:hidden">
            {samples.map((sample, index) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => setEditingIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEditingIndex(index);
                  }
                }}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-panel border border-rule
                  bg-surface p-4 shadow-panel active:bg-brand-soft
                  focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/25"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-h3 text-ink">{titleOf(sample, index)}</span>
                  <span className="truncate text-caption text-ink-soft">{subtitleOf(sample)}</span>
                </div>

                {editable && (
                  // 삭제 탭이 카드 전체 탭으로 번지지 않게 차단한다
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      variant="ghost" size="icon-sm" label={`${titleOf(sample, index)} 삭제`}
                      icon={<Trash2 size={16} />}
                      onClick={() => onRemoveSample(index)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 데스크탑 — 행=항목, 열=입력 항목인 표에서 바로 편집한다. */}
          <InputTable
            className="hidden md:block"
            rows={samples}
            columns={columns}
            getRowKey={(_, index) => index}
            editable={editable}
          />

        </>
      )}

      {/* 모바일 카드의 편집 표면. 입력은 즉시 시트에 반영되므로 이탈 경고를 끈다. */}
      <FormDialog
        open={editingSample != null}
        onOpenChange={(open) => { if (!open) setEditingIndex(null); }}
        title={editingSample ? titleOf(editingSample, editingIndex ?? 0) : ""}
        description="가스상 물질 채취 정보를 입력합니다."
        submitLabel="확인"
        cancelLabel="닫기"
        isDirty={false}
        onSubmit={(e) => { e.preventDefault(); setEditingIndex(null); }}
      >
        {editingSample && editingIndex != null && (
          <div className="grid grid-cols-1 gap-y-3">
            {GAS_FIELDS.map((f) => (
              <UnitField
                key={f.field}
                label={f.label}
                required={isRequired(f.field)}
                hint={f.hint}
                unit={f.unit}
                type={f.type}
                min={f.min}
                step={f.step}
                value={editingSample[f.field]}
                disabled={!editable}
                tone={fieldTone(fieldPath.sample(editingIndex, f.field))}
                onFocus={() => onFieldFocus(fieldPath.sample(editingIndex, f.field))}
                onChange={(v) => onSampleChange(editingIndex, { [f.field]: v })}
              />
            ))}
          </div>
        )}
      </FormDialog>
    </SectionAccordion>
  );
};
