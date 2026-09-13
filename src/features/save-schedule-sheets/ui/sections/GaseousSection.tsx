import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { SectionAccordion } from "@shared/ui/accordion";
import { Button, IconButton } from "@shared/ui/buttons";
import { FormDialog } from "@shared/ui/dialogs";
import { UnitField } from "@shared/ui/form";
import { InputTable, type InputTableColumn } from "@shared/ui/table";

import { GAS_SAMPLE_HINT } from "../../model/field-hints";
import type { GasSampleGroup } from "../../model/gaseous-rows";
import type { SampleFieldKey } from "../../model/required-fields";
import { REQUIRED_SAMPLE_FIELDS, fieldPath } from "../../model/required-fields";
import type { SampleForm } from "../../model/types";
import type { FieldStateProps, SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps, FieldStateProps {
  samples: SampleForm[];
  /**
   * 아직 어느 기록지에도 적히지 않은 측정항목. 판정이 기록지 전체를 가로지르므로
   * 이 표에 없다는 뜻이 아니라 **어디에도 없다**는 뜻이다.
   */
  unassignedGroups: GasSampleGroup[];
  /** 카탈로그 투영값이 없어 자동으로 만들 수 없는 항목명 */
  unresolvedItemNames: string[];
  editable: boolean;
  onSampleChange: (index: number, patch: Partial<SampleForm>) => void;
  onAddSample: () => void;
  onAddUnassignedSamples: () => void;
  onRemoveSample: (index: number) => void;
  /** 행 순서 바꾸기 — 기록지는 실제 채취 순서대로 적으므로 측정항목 순서와 다를 수 있다 */
  onMoveSample: (from: number, to: number) => void;
}

interface GasFieldBase {
  field: SampleFieldKey;
  label: string;
  unit?: string;
  /** 데스크탑 표의 열 폭 (px) — 표는 가로 스크롤이므로 항목별로 다르게 준다 */
  width: number;
  hint?: string;
}

/**
 * 숫자 칸 — 입력 스펙을 여기서만 선언한다.
 *
 * 자릿수를 **필수 키로 둔 이유는 `point-fields.tsx` 의 `min` 과 같다** — 선택 속성이면
 * "이 항목이 몇 자리까지 나오는가" 를 아무도 판단하지 않은 채 무제한이 된다.
 */
interface GasNumberField extends GasFieldBase {
  type: "number";
  step?: number;
  /** 음수가 성립하지 않는 항목(무게·부피·유량)에만 준다 — `NumericField` 의 ± 버튼이 빠진다 */
  min?: number;
  maxIntDigits: number;
  maxDecimals: number;
}

/** 숫자가 아닌 칸 — `min`·`step`·자릿수는 의미가 없어 아예 받지 않는다 */
interface GasPlainField extends GasFieldBase {
  type: "text" | "time";
}

type GasField = GasNumberField | GasPlainField;

/** 숫자 칸에만 붙는 입력 스펙 — 데스크탑 표와 모바일 모달이 같은 것을 쓴다 */
const numericSpec = (f: GasField) =>
  f.type === "number"
    ? { min: f.min, step: f.step, maxIntDigits: f.maxIntDigits, maxDecimals: f.maxDecimals }
    : {};

/** 필수 별표는 손으로 적지 않는다 — 저장 검증·진행도 배지와 같은 목록에서 파생시킨다 */
const isRequired = (field: SampleFieldKey): boolean => REQUIRED_SAMPLE_FIELDS.includes(field);

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
    maxIntDigits: 3, maxDecimals: 1,   // 채취 펌프 유량은 수 L/min — 세 자리면 이미 이상값이다
    width: 110, hint: GAS_SAMPLE_HINT.suctionQuantity,
  },
  {
    field: "gasMeterGaugePressure", label: "가스미터압", unit: "mmH₂O", type: "number", step: 0.1,
    maxIntDigits: 3, maxDecimals: 1,   // 부호는 자릿수에 세지 않는다
    width: 120, hint: GAS_SAMPLE_HINT.gasMeterGaugePressure,
  },
  {
    field: "inTemperature", label: "가스미터온도 (입구)", unit: "°C", type: "number", step: 0.1,
    maxIntDigits: 3, maxDecimals: 1,   // 외기~수백 °C
    width: 130, hint: GAS_SAMPLE_HINT.gasMeterTemperature,
  },
  {
    field: "outTemperature", label: "가스미터온도 (출구)", unit: "°C", type: "number", step: 0.1,
    maxIntDigits: 3, maxDecimals: 1,
    width: 130, hint: GAS_SAMPLE_HINT.gasMeterTemperature,
  },
  {
    field: "samplingVolume", label: "시료채취량", unit: "L", type: "number", min: 0, step: 0.1,
    maxIntDigits: 5, maxDecimals: 1,   // 수십~수천 L
    width: 120, hint: GAS_SAMPLE_HINT.samplingVolume,
  },
  {
    field: "beforeVolume", label: "채취 전 적산값", unit: "L", type: "number", min: 0, step: 0.01,
    maxIntDigits: 6, maxDecimals: 2,   // 적산계가 6자리다
    width: 130, hint: GAS_SAMPLE_HINT.volume,
  },
  {
    field: "afterVolume", label: "채취 후 적산값", unit: "L", type: "number", min: 0, step: 0.01,
    maxIntDigits: 6, maxDecimals: 2,
    width: 130, hint: GAS_SAMPLE_HINT.volume,
  },
  { field: "sampleNumber", label: "본시료", type: "text", width: 120, hint: GAS_SAMPLE_HINT.sampleNumber },
  { field: "blankSampleNumber", label: "바탕시료", type: "text", width: 120, hint: GAS_SAMPLE_HINT.blankSampleNumber },
];

const ROW_LABEL_WIDTH = 48;
// 위·아래·삭제 세 버튼이 들어간다
const ACTION_WIDTH = 116;

const titleOf = (sample: SampleForm, index: number): string =>
  sample.sampleName.trim() || `항목 #${index + 1}`;

/** 카드 부제 — 채취시간과 본시료번호를 한 줄로 요약한다 */
const subtitleOf = (sample: SampleForm): string => {
  const time = sample.startTime && sample.endTime
    ? `${sample.startTime} ~ ${sample.endTime}` : sample.startTime || "시간 미입력";
  return sample.sampleNumber.trim() ? `${time} · ${sample.sampleNumber.trim()}` : time;
};

/**
 * 행 순서 조작 — 데스크탑 표와 모바일 카드가 같은 것을 쓴다.
 *
 * 드래그 대신 버튼인 이유는 데스크탑 표가 12열 가로 스크롤이라 끌어 옮길 자리가 없기 때문이다.
 * `@shared/ui/sortable` 도 드래그와 함께 같은 모양의 위·아래 버튼을 함께 제공한다.
 */
const MoveButtons = ({ title, index, total, onMove }: {
  title: string;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
}) => (
  <>
    <IconButton
      variant="ghost" size="icon-sm" label={`${title} 위로 이동`}
      icon={<ArrowUp size={16} />}
      disabled={index === 0}
      onClick={() => onMove(index, index - 1)}
    />
    <IconButton
      variant="ghost" size="icon-sm" label={`${title} 아래로 이동`}
      icon={<ArrowDown size={16} />}
      disabled={index === total - 1}
      onClick={() => onMove(index, index + 1)}
    />
  </>
);

/**
 * 가스상 물질 채취 정보.
 *
 * 기록지(시트)마다 존재하며 입자상·가스상 카테고리를 가리지 않는다.
 * 표현은 폭에 따라 갈린다 — 데스크탑은 행=항목인 표에서 바로 편집하고,
 * 모바일은 제목만 보이는 카드를 눌러 모달에서 고친다(칸이 12개라 카드에 펼치면 읽히지 않는다).
 */
export const GaseousSection = ({
  samples, unassignedGroups, unresolvedItemNames, editable,
  onSampleChange, onAddSample, onAddUnassignedSamples, onRemoveSample, onMoveSample,
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
      ...numericSpec(f),
      value: (sample) => sample[f.field],
      tone: (_, index) => fieldTone(fieldPath.sample(index, f.field)),
      onFocus: (_, index) => onFieldFocus(fieldPath.sample(index, f.field)),
      onChange: (_, v, index) => onSampleChange(index, { [f.field]: v }),
    })),

    {
      kind: "action", header: "순서 · 삭제", width: ACTION_WIDTH,
      render: (sample, index) => (
        <div className="flex items-center justify-center">
          <MoveButtons
            title={titleOf(sample, index)}
            index={index}
            total={samples.length}
            onMove={onMoveSample}
          />
          <IconButton
            variant="ghost" size="icon-sm" label={`${titleOf(sample, index)} 삭제`}
            icon={<Trash2 size={16} />}
            onClick={() => onRemoveSample(index)}
          />
        </div>
      ),
    },
  ];

  const addButton = editable ? (
    <Button type="button" variant="outline" size="sm" onClick={onAddSample}>
      <Plus size={14} />항목 추가
    </Button>
  ) : null;

  /**
   * 어느 기록지에도 적히지 않은 항목 안내.
   *
   * "이 표에 없다"가 아니라 **어디에도 없다**는 뜻이다 — 기록지를 옮겨 적는 흐름을 지원하려고
   * 판정을 전체로 넓혔기 때문이다. 첫 기록지에서 행을 지우면 여기에 다시 나타난다.
   */
  const unassignedBanner = unassignedGroups.length > 0 && editable ? (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-panel border border-info/30
        bg-info-soft px-3 py-2"
    >
      <span className="text-body-3 text-info-ink">
        측정항목 {unassignedGroups.length}건이 어느 기록지에도 등록되지 않았습니다. —{" "}
        {unassignedGroups.map((group) => group.sampleName).join(", ")}
      </span>
      <Button type="button" variant="outline" size="sm" onClick={onAddUnassignedSamples}>
        <Plus size={14} />이 기록지에 추가
      </Button>
    </div>
  ) : null;

  // 카탈로그 투영값이 없어(구 스냅샷·고객사 자체 물질) 입자상인지조차 알 수 없는 항목.
  // 자동으로 만들면 엉뚱한 행이 생기므로 만들지 않고 존재만 알린다.
  const unresolvedNotice = unresolvedItemNames.length > 0 ? (
    <p className="text-caption text-muted-ink">
      채취 방법이 등록되지 않은 항목 {unresolvedItemNames.length}건
      ({unresolvedItemNames.join(", ")})은 자동으로 만들 수 없습니다. 필요하면 직접 추가하세요.
    </p>
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

      {unassignedBanner}
      {unresolvedNotice}

      {samples.length === 0 ? (
        <p className="text-body-3 text-muted-ink">
          {unassignedGroups.length > 0
            ? "위 안내에서 측정항목을 이 기록지로 가져오거나 직접 추가하세요."
            : "등록된 채취 항목이 없습니다."}
        </p>
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
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-h3 text-ink">{titleOf(sample, index)}</span>
                  </span>
                  <span className="truncate text-caption text-ink-soft">{subtitleOf(sample)}</span>
                </div>

                {editable && (
                  // 조작 탭이 카드 전체 탭(편집 모달 열기)으로 번지지 않게 차단한다.
                  // 키보드도 함께 막아야 한다 — 버튼에서 Enter 를 누르면 카드의 onKeyDown 까지
                  // 올라가 순서만 바꾸려던 조작이 편집 모달을 함께 연다.
                  <div
                    className="flex shrink-0 items-center"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <MoveButtons
                      title={titleOf(sample, index)}
                      index={index}
                      total={samples.length}
                      onMove={onMoveSample}
                    />
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
                {...numericSpec(f)}
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
