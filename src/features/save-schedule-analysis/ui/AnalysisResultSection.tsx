import { Save, Trash2 } from "lucide-react";

import { SectionAccordion } from "@shared/ui/accordion";
import { Badge } from "@shared/ui/badges";
import { Button, IconButton } from "@shared/ui/buttons";
import { InputGroup } from "@shared/ui/form";
import { InputTable, type InputTableColumn } from "@shared/ui/table";

import type { AnalysisRowForm } from "../model/types";

interface Props {
  rows: AnalysisRowForm[];
  fieldErrors: Record<number, string>;
  editable: boolean;
  isDirty: boolean;
  isLoading: boolean;
  filledCount: number;
  onChange: (pollutantId: number, patch: Partial<AnalysisRowForm>) => void;
  onSave: () => void;
  onRemove: (row: AnalysisRowForm) => void;
}

/** 입력을 받는 필드 — 나머지 행 정보는 읽기 전용이다 */
type InputField = "analysisValue" | "unit" | "analysisMethod" | "analysisEquipment";

/** 입력 칸 정의. 표의 열 순서 = 모바일 카드의 입력 순서다. */
const INPUT_FIELDS: { field: InputField; label: string; width: number; placeholder: string }[] = [
  { field: "analysisValue", label: "측정분석값", width: 130, placeholder: "0" },
  { field: "unit", label: "측정단위", width: 110, placeholder: "ppm" },
  { field: "analysisMethod", label: "측정분석방법", width: 190, placeholder: "예) 자외선형광법" },
  { field: "analysisEquipment", label: "분석장비", width: 190, placeholder: "예) 가스크로마토그래프" },
];

const NAME_WIDTH = 150;
const ALLOWANCE_WIDTH = 120;
const OXYGEN_WIDTH = 90;
const ACTION_WIDTH = 44;

/** 분석값만 숫자 입력이다 — 나머지 셋은 자유 서술이라 텍스트로 받는다 */
const isNumericField = (field: InputField) => field === "analysisValue";

const allowanceText = (row: AnalysisRowForm): string =>
  row.allowance === null ? "-" : String(row.allowance);

const oxygenText = (row: AnalysisRowForm): string =>
  row.oxygenApplicable ? "적용" : "미적용";

/**
 * 측정항목별 실험분석 결과.
 *
 * 행은 이번 계획의 측정항목 전체다 — 아직 입력하지 않은 항목도 빈 행으로 남아 무엇이 밀렸는지 보인다.
 * 허용기준치·산소농도보정 적용 여부는 측정 시점 원장 값이라 읽기 전용으로 나란히 두고,
 * 입력은 분석값·단위·분석방법·분석장비 넷만 받는다.
 */
export const AnalysisResultSection = ({
  rows, fieldErrors, editable, isDirty, isLoading, filledCount,
  onChange, onSave, onRemove,
}: Props) => {
  const columns: InputTableColumn<AnalysisRowForm>[] = [
    {
      kind: "label", header: "측정항목", width: NAME_WIDTH, align: "left",
      render: (row) => row.pollutantName,
    },
    { kind: "readonly", header: "허용기준치", width: ALLOWANCE_WIDTH, render: allowanceText },
    { kind: "readonly", header: "산소보정", width: OXYGEN_WIDTH, render: oxygenText },

    ...INPUT_FIELDS.map((f): InputTableColumn<AnalysisRowForm> => ({
      kind: "input",
      header: f.label,
      width: f.width,
      type: isNumericField(f.field) ? "number" : "text",
      min: isNumericField(f.field) ? 0 : undefined,
      step: isNumericField(f.field) ? 0.001 : undefined,
      placeholder: f.placeholder,
      value: (row) => row[f.field],
      onChange: (row, v) => onChange(row.pollutantId, { [f.field]: v }),
    })),

    {
      kind: "action", header: "삭제", width: ACTION_WIDTH,
      render: (row) => row.analysisId ? (
        <IconButton
          variant="ghost" size="icon-sm" label={row.pollutantName + " 분석 결과 삭제"}
          icon={<Trash2 size={16} />}
          onClick={() => onRemove(row)}
        />
      ) : null,
    },
  ];

  return (
    <SectionAccordion
      title="항목별 분석 결과"
      description="허용기준치·산소농도보정 적용 여부는 측정 시점 원장 값이라 수정할 수 없습니다."
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

          {/* 모바일 — 항목당 카드. 입력 칸이 넷뿐이라 펼쳐 두어도 읽힌다. */}
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

                  {editable && row.analysisId && (
                    <IconButton
                      variant="ghost" size="icon-sm" label={row.pollutantName + " 분석 결과 삭제"}
                      icon={<Trash2 size={16} />}
                      onClick={() => onRemove(row)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {INPUT_FIELDS.map((f) => (
                    <InputGroup
                      key={f.field}
                      label={f.label}
                      type={isNumericField(f.field) ? "number" : "text"}
                      min={isNumericField(f.field) ? 0 : undefined}
                      step={isNumericField(f.field) ? 0.001 : undefined}
                      placeholder={f.placeholder}
                      value={row[f.field]}
                      disabled={!editable}
                      onChange={(v: string) => onChange(row.pollutantId, { [f.field]: v })}
                      error={isNumericField(f.field) ? fieldErrors[row.pollutantId] : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {editable && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-caption text-muted-ink">
                값을 입력한 항목만 저장됩니다. 이미 저장된 항목은 수정으로 반영됩니다.
              </span>
              <Button size="sm" startIcon={Save} onClick={onSave} disabled={!isDirty || isLoading}>
                {isLoading ? "저장 중..." : "분석 결과 저장"}
              </Button>
            </div>
          )}
        </>
      )}
    </SectionAccordion>
  );
};
