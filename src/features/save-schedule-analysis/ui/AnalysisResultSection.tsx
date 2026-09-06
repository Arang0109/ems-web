import { ClipboardList, Save } from "lucide-react";

import { measurementUnitOptions, toMeasurementUnit } from "@shared/model";
import { SectionAccordion } from "@shared/ui/accordion";
import { Badge } from "@shared/ui/badges";
import { Button } from "@shared/ui/buttons";
import { InputGroup, Select, UnitField } from "@shared/ui/form";
import { InputTable, type InputTableColumn } from "@shared/ui/table";

import type { AnalysisRowForm } from "../model/types";

interface Props {
  rows: AnalysisRowForm[];
  fieldErrors: Record<number, string>;
  editable: boolean;
  isDirty: boolean;
  isLoading: boolean;
  filledCount: number;
  timeFilledCount: number;
  onChange: (pollutantId: number, patch: Partial<AnalysisRowForm>) => void;
  onSave: () => void;
  /** 현장 기록지의 통칭 시료 행에서 항목별 채취시각을 펴 온다 */
  onImportSamplingTimes: () => void;
}

/** 입력을 받는 필드 — 나머지 행 정보는 읽기 전용이다 */
type InputField = "analysisValue" | "unit" | "analysisMethod" | "analysisEquipment";

/**
 * 입력 칸 정의. 표의 열 순서 = 모바일 카드의 입력 순서다.
 *
 * `control` 이 칸의 생김새를 정한다 — 분석값만 숫자이고, 단위는 정해진 표기 중에서 고른다.
 * 분석방법·장비는 현장마다 문구가 달라 자유 서술로 둔다.
 */
type FieldSpec =
  | { field: InputField; label: string; width: number; control: "text" | "number"; placeholder: string }
  | { field: "unit"; label: string; width: number; control: "select"; placeholder: string };

const INPUT_FIELDS: FieldSpec[] = [
  { field: "analysisValue", label: "측정분석값", width: 130, control: "number", placeholder: "0" },
  { field: "unit", label: "측정단위", width: 130, control: "select", placeholder: "단위 선택" },
  { field: "analysisMethod", label: "측정분석방법", width: 190, control: "text", placeholder: "예) 자외선형광법" },
  { field: "analysisEquipment", label: "분석장비", width: 190, control: "text", placeholder: "예) 가스크로마토그래프" },
];

/** 채취시각 — 실험실 입력값과 저장 경로가 다르지만 같은 행의 칸이라 한 표에서 받는다 */
const TIME_FIELDS: { field: "samplingStartedAt" | "samplingEndedAt"; label: string }[] = [
  { field: "samplingStartedAt", label: "채취 시작시각" },
  { field: "samplingEndedAt", label: "채취 종료시각" },
];

const NAME_WIDTH = 150;
const ALLOWANCE_WIDTH = 120;
const OXYGEN_WIDTH = 90;
const TIME_WIDTH = 140;

const allowanceText = (row: AnalysisRowForm): string =>
  row.allowance === null ? "-" : String(row.allowance);

const oxygenText = (row: AnalysisRowForm): string =>
  row.oxygenApplicable ? "적용" : "미적용";

/**
 * 측정항목별 실험분석 결과.
 *
 * 행은 이번 계획의 측정항목 전체다 — 아직 입력하지 않은 항목도 빈 행으로 남아 무엇이 밀렸는지 보인다.
 * 허용기준치·산소농도보정 적용 여부는 측정 시점 원장 값이라 읽기 전용으로 나란히 두고,
 * 입력은 채취시각 둘과 분석값·단위·분석방법·분석장비 넷을 받는다.
 *
 * <b>채취시각이 여기 있는 이유</b> — 서버에서 시각과 분석값은 항목당 한 문서의 다른 칸이다.
 * 화면을 나눠 두면 같은 행을 두 탭에서 따로 열어야 하고, 같은 목록을 두 번 조회하게 된다.
 * 저장 경로만 서버 계약대로 갈라 호출한다(훅이 바뀐 쪽을 판정한다).
 *
 * 현장 채취 탭의 시각은 자동으로 반영하지 않는다. 채취기록지는 알데히드류를 VOCs 로 통칭해
 * 시료 한 건으로 적지만 성적서는 항목마다 따로 쓰고(시료 1건 ↔ 항목 N건), 그 통칭 규칙이
 * 업체마다 달라 자동 복사는 조용히 틀린 시각을 남긴다.
 */
export const AnalysisResultSection = ({
  rows, fieldErrors, editable, isDirty, isLoading, filledCount, timeFilledCount,
  onChange, onSave, onImportSamplingTimes,
}: Props) => {
  const columns: InputTableColumn<AnalysisRowForm>[] = [
    {
      kind: "label", header: "측정항목", width: NAME_WIDTH, align: "left",
      render: (row) => row.pollutantName,
    },
    { kind: "readonly", header: "허용기준치", width: ALLOWANCE_WIDTH, render: allowanceText },
    { kind: "readonly", header: "산소보정", width: OXYGEN_WIDTH, render: oxygenText },

    // 채취가 분석보다 먼저 일어나므로 실험실 입력 칸보다 앞에 둔다
    ...TIME_FIELDS.map((f): InputTableColumn<AnalysisRowForm> => ({
      kind: "input",
      header: f.label,
      width: TIME_WIDTH,
      type: "time",
      value: (row) => row[f.field],
      onChange: (row, v) => onChange(row.pollutantId, { [f.field]: v }),
    })),

    ...INPUT_FIELDS.map((f): InputTableColumn<AnalysisRowForm> =>
      f.control === "select"
        ? {
            kind: "select",
            header: f.label,
            width: f.width,
            options: measurementUnitOptions,
            placeholder: f.placeholder,
            value: (row) => row.unit,
            onChange: (row, v) => onChange(row.pollutantId, { unit: toMeasurementUnit(v) }),
          }
        : {
            kind: "input",
            header: f.label,
            width: f.width,
            type: f.control,
            min: f.control === "number" ? 0 : undefined,
            step: f.control === "number" ? 0.001 : undefined,
            placeholder: f.placeholder,
            value: (row) => row[f.field],
            onChange: (row, v) => onChange(row.pollutantId, { [f.field]: v }),
          },
    ),
  ];

  return (
    <SectionAccordion
      title="항목별 채취시간·분석 결과"
      subtitle={
        rows.length > 0 && (
          <span className="text-body-4 text-muted-ink">채취시간 {timeFilledCount}/{rows.length}</span>
        )
      }
      description="채취시각은 성적서 양식의 항목별 채취시각 칸에 그대로 실립니다 — 현장 채취 탭의 시각은 여러 항목을 한 시료로 통칭해 적으므로 자동 반영되지 않습니다. 허용기준치·산소농도보정 적용 여부는 측정 시점 원장 값이라 수정할 수 없습니다."
      progress={{ done: filledCount, total: rows.length }}
      progressTone={rows.length > 0 && filledCount === rows.length ? "brand" : "neutral"}
      defaultOpen
    >
      {rows.length === 0 ? (
        <p className="text-body-3 text-muted-ink">
          이번 계획에 측정항목이 없습니다. 측정정보 탭에서 측정항목을 먼저 지정해 주세요.
        </p>
      ) : (
        <>
          {/* 데스크탑 — 행=측정항목인 표에서 바로 편집한다. */}
          <InputTable
            className="hidden md:block"
            rows={rows}
            columns={columns}
            getRowKey={(row) => row.pollutantId}
            editable={editable}
            rowError={(row) =>
              fieldErrors[row.pollutantId]
                ? `${row.pollutantName} — ${fieldErrors[row.pollutantId]}`
                : undefined
            }
          />

          {/* 모바일 — 항목당 카드. 채취시각을 위에, 실험실 입력값을 아래에 둔다(표의 열 순서와 같다). */}
          <div className="space-y-3 md:hidden">
            {rows.map((row) => (
              <div key={row.pollutantId} className="space-y-3 rounded-panel border border-rule bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-h3 text-ink">{row.pollutantName}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone="neutral">허용기준 {allowanceText(row)}</Badge>
                      <Badge tone={row.oxygenApplicable ? "brand" : "neutral"}>
                        산소보정 {oxygenText(row)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 시각 필드는 시계 버튼을 달고 있어 한 줄에 하나씩 세운다. */}
                <div className="grid grid-cols-1 gap-3">
                  {TIME_FIELDS.map((f) => (
                    <UnitField
                      key={f.field}
                      label={f.label}
                      type="time"
                      value={row[f.field]}
                      disabled={!editable}
                      onChange={(v) => onChange(row.pollutantId, { [f.field]: v })}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {INPUT_FIELDS.map((f) => f.control === "select" ? (
                    <Select
                      key={f.field}
                      label={f.label}
                      options={measurementUnitOptions}
                      placeholder={f.placeholder}
                      value={row.unit}
                      disabled={!editable}
                      onValueChange={(v) => onChange(row.pollutantId, { unit: v ?? "" })}
                    />
                  ) : (
                    <InputGroup
                      key={f.field}
                      label={f.label}
                      type={f.control}
                      min={f.control === "number" ? 0 : undefined}
                      step={f.control === "number" ? 0.001 : undefined}
                      placeholder={f.placeholder}
                      value={row[f.field]}
                      disabled={!editable}
                      onChange={(v: string) => onChange(row.pollutantId, { [f.field]: v })}
                      error={f.control === "number" ? fieldErrors[row.pollutantId] : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {editable && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-caption text-muted-ink">
                값을 고친 항목만 저장됩니다 — 측정분석방법·분석장비는 측정항목 원장 값을 미리 채워둔
                것이라 그대로 두면 기록되지 않습니다. 채취시각은 비운 칸도 저장 시 지워집니다 —
                자정을 넘겨 채취한 경우 종료가 시작보다 이른 시각이어도 됩니다.
              </span>
              <div className="flex items-center gap-2">
                {/*
                  기록지는 알데히드류를 VOCs 한 행으로 적지만 여기는 항목마다 한 줄이다.
                  가져오면 그 한 행의 시각이 해당 항목들로 펴진다.
                */}
                <Button
                  size="sm" variant="outline" startIcon={ClipboardList}
                  onClick={onImportSamplingTimes} disabled={isLoading}
                >
                  기록지 채취시각 가져오기
                </Button>
                <Button size="sm" startIcon={Save} onClick={onSave} disabled={!isDirty || isLoading}>
                  {isLoading ? "저장 중..." : "저장"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </SectionAccordion>
  );
};
