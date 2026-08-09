import type { ReactNode } from "react";
import { Plus, Sparkles, X } from "lucide-react";

import type { SheetCalcPreview } from "@entities/schedule";
import { toNumberOrNull } from "@shared/lib";
import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";
import { Button, IconButton } from "@shared/ui/buttons";
import { UnitField } from "@shared/ui/form";
import { TableLabelCell, TableInputCell, TableResultCell } from "@shared/ui/table";

import type { ParticleForm, SamplingPointForm } from "../../model/types";
import { FIELD_GRID, type SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps {
  isParticle: boolean;
  points: SamplingPointForm[];
  particle: ParticleForm;
  preview: SheetCalcPreview | null;
  nozzleOptions: { value: string; label: string }[];
  editable: boolean;
  onPointChange: (index: number, patch: Partial<SamplingPointForm>) => void;
  onAddPoint: () => void;
  onRemovePoint: (index: number) => void;
  onParticleChange: (patch: Partial<ParticleForm>) => void;
  onOpenNozzleRecommend: () => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

// 표시 전용 입력값 평균 (DGM 온도 행의 평균열) — 입력된 값만, 소수 1자리
const avgOf = (values: string[]): string => {
  const nums = values.map(toNumberOrNull).filter((v): v is number => v !== null);
  if (nums.length === 0) return "-";
  return String(Math.round((nums.reduce((a, v) => a + v, 0) / nums.length) * 10) / 10);
};

// 지점별 입력 항목 — 모바일 카드와 데스크탑 전치 테이블이 같은 목록을 공유한다.
const POINT_FIELDS: {
  field: keyof SamplingPointForm;
  label: ReactNode;
  unit: string;
  step?: number;
  particleOnly?: boolean;
}[] = [
  { field: "Ts", label: <>배출가스온도 (T<sub>s</sub>)</>, unit: "°C", step: 0.1 },
  { field: "Pv", label: <>동압 (ΔP)</>, unit: "mmH₂O", step: 0.1 },
  { field: "Ps", label: <>정압 (P<sub>s</sub>)</>, unit: "mmH₂O", step: 0.1 },
  { field: "inTm", label: "DGM 입구온도", unit: "°C", step: 0.1, particleOnly: true },
  { field: "outTm", label: "DGM 출구온도", unit: "°C", step: 0.1, particleOnly: true },
  { field: "samplingTime", label: "채취시간", unit: "min", particleOnly: true },
  { field: "beforeVm", label: "흡입량 전", unit: "m³", step: 0.00001, particleOnly: true },
  { field: "afterVm", label: "흡입량 후", unit: "m³", step: 0.00001, particleOnly: true },
  { field: "vacuumGaugePressure", label: "진공게이지압", unit: "mmHg", particleOnly: true },
  { field: "finalImpingerTemperature", label: "최종임핀저 출구온도", unit: "°C", step: 0.1, particleOnly: true },
];

/**
 * 측정점 정보.
 *
 * 이 섹션만 반응형 예외다 — 행=항목, 열=측정점(1..n지점)인 전치 구조라
 * 다열 그리드로 펴면 "지점 간 값 비교"라는 이 표의 목적이 사라진다.
 * 따라서 모바일은 지점별 카드, md 이상은 기존 전치 테이블을 유지한다.
 * 지점과 무관한 시트 단위 값(노즐·채취시각·유량 등)은 표 밖 공통 그리드에 한 번만 둔다.
 */
export const SamplingPointSection = ({
  isParticle, points, particle, preview, nozzleOptions, editable,
  onPointChange, onAddPoint, onRemovePoint, onParticleChange, onOpenNozzleRecommend,
  ...shell
}: Props) => {
  const n = points.length;
  const wide = n + 1;                       // 지점 열 + 평균 열 (라벨 제외)
  const quantity = preview?.quantity ?? null;
  const particleCalc = preview?.particle ?? null;
  const pointCalc = (i: number) => preview?.points[i] ?? null;

  const fields = POINT_FIELDS.filter((f) => isParticle || !f.particleOnly);

  // 지점별 입력값 평균 — 계산 미리보기가 제공하는 값이 있으면 그것을, 없으면 입력 평균을 쓴다.
  const averageOf = (field: keyof SamplingPointForm): string => {
    switch (field) {
      case "Ts": return display(quantity?.avgTg == null ? null : quantity.avgTg - 273);
      case "Pv": return display(quantity?.avgPv);
      case "Ps": return display(quantity?.avgPs);
      case "samplingTime": return display(particleCalc?.totalSamplingTime);
      case "inTm":
      case "outTm": return avgOf(points.map((p) => p[field]));
      default: return "-";
    }
  };

  // 지점별 계산 결과 (입자상 전용)
  const pointResults: { label: ReactNode; value: (i: number) => number | null | undefined; avg: string }[] = [
    { label: <>배출가스 유속 (V<sub>s</sub>)</>, value: (i) => pointCalc(i)?.Vs, avg: display(quantity?.Vs) },
    { label: "오리피스 차압 (ΔH)", value: (i) => pointCalc(i)?.orificeDp, avg: display(particleCalc?.avgOrificeDp) },
    { label: "K-Factor", value: (i) => pointCalc(i)?.kFactor, avg: display(particleCalc?.avgKFactor) },
    { label: <>채취량 (V<sub>m</sub>)</>, value: (i) => pointCalc(i)?.Vm, avg: display(particleCalc?.totalVm) },
    { label: "등속흡입계수 (I, %)", value: (i) => pointCalc(i)?.isokineticRatio, avg: display(particleCalc?.avgIsokineticRatio) },
  ];

  return (
    <SectionAccordion
      {...shell}
      title="측정점 정보"
      description="지점별 측정값을 입력하면 유속·채취량·등속흡입계수가 자동으로 계산됩니다."
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body-3 text-muted-ink">
          연도 단면적 <span className="text-body-4 text-ink">{display(quantity?.area)}</span> m² ·
          규정 요구 측정점 수 <span className="text-body-4 text-ink">{display(preview?.samplingPointCnt)}</span>
        </p>
        {editable && (
          <Button type="button" variant="outline" size="sm" onClick={onAddPoint}>
            <Plus size={14} />측정점 추가
          </Button>
        )}
      </div>

      {/* 모바일 — 지점별 카드 */}
      <div className="space-y-3 md:hidden">
        {points.map((point, i) => (
          <SubAccordion
            key={i}
            title={`${i + 1} 지점`}
            defaultOpen={i === 0}
            action={
              editable && n > 1 ? (
                <IconButton
                  variant="ghost" size="icon-sm" label={`${i + 1}지점 삭제`}
                  icon={<X size={16} />}
                  onClick={() => onRemovePoint(i)}
                />
              ) : undefined
            }
          >
            <div className="grid grid-cols-1 gap-y-3">
              {fields.map((f) => (
                <UnitField
                  key={String(f.field)}
                  label={f.label} required unit={f.unit} type="number" step={f.step}
                  value={point[f.field]} disabled={!editable}
                  onChange={(v) => onPointChange(i, { [f.field]: v })}
                />
              ))}
              {isParticle && pointResults.map((r, ri) => (
                <UnitField
                  key={ri} label={r.label} readOnly value={display(r.value(i))}
                />
              ))}
            </div>
          </SubAccordion>
        ))}

        <SubAccordion title="지점 평균 자동계산값">
          <div className="grid grid-cols-1 gap-y-3">
            {fields.map((f) => (
              <UnitField
                key={String(f.field)}
                label={<>{f.label} 평균</>} unit={f.unit} readOnly value={averageOf(f.field)}
              />
            ))}
            {isParticle && pointResults.map((r, ri) => (
              <UnitField key={ri} label={<>{r.label} 평균</>} readOnly value={r.avg} />
            ))}
          </div>
        </SubAccordion>
      </div>

      {/* 데스크탑 — 행=항목, 열=지점인 전치 테이블 */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse" style={{ minWidth: `${180 + wide * 90}px` }}>
          <tbody>
            <tr>
              <TableLabelCell>측정점</TableLabelCell>
              {points.map((_, i) => (
                <th key={i} scope="col"
                  className="bg-canvas border border-rule p-1 text-center text-label text-ink whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    {i + 1} 지점
                    {editable && n > 1 && (
                      <button type="button" onClick={() => onRemovePoint(i)}
                        className="text-muted-ink hover:text-danger" aria-label={`${i + 1}지점 삭제`}>
                        <X size={12} />
                      </button>
                    )}
                  </span>
                </th>
              ))}
              <TableLabelCell>평균</TableLabelCell>
            </tr>

            {fields.map((f) => (
              <tr key={String(f.field)}>
                <TableLabelCell>{f.label} ({f.unit})</TableLabelCell>
                {points.map((p, i) => (
                  <TableInputCell key={i} type="number" value={p[f.field]} unit={f.unit} step={f.step}
                    onChange={(v) => onPointChange(i, { [f.field]: v })} disabled={!editable} />
                ))}
                <TableResultCell value={averageOf(f.field)} />
              </tr>
            ))}

            {isParticle && pointResults.map((r, ri) => (
              <tr key={ri}>
                <TableLabelCell>{r.label}</TableLabelCell>
                {points.map((_, i) => (
                  <TableResultCell key={i} value={display(r.value(i))} />
                ))}
                <TableResultCell value={r.avg} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 시트 단위 값 — 지점과 무관하므로 표 밖에 한 번만 둔다 */}
      {isParticle && (
        <>
          <div className={FIELD_GRID}>
            {/* 옵션 라벨이 이미 "3 cm" 형태라 단위 박스를 따로 두지 않는다. */}
            <UnitField
              label="노즐 사이즈 (cm)" required options={nozzleOptions} placeholder="노즐 선택"
              value={particle.nozzleSize} disabled={!editable}
              onChange={(v) => onParticleChange({ nozzleSize: v })}
            />
            <UnitField
              label="채취 시작시간" required type="time"
              value={particle.samplingStartTime} disabled={!editable}
              onChange={(v) => onParticleChange({ samplingStartTime: v })}
            />
            {/* 시작시간 + Σ채취시간으로 자동 계산 */}
            <UnitField label="채취 종료시간" readOnly value={particle.samplingEndTime || "-"} />
            <UnitField label={<>피토우관 계수 (C<sub>p</sub>)</>} readOnly value={display(quantity?.Cp)} />
            <UnitField label="배출가스 밀도 (ρ)" unit="kg/m³" readOnly value={display(quantity?.gasDensity)} />
          </div>

          <Button type="button" variant="outline" onClick={onOpenNozzleRecommend} disabled={!editable}>
            <Sparkles size={14} />적정 노즐사이즈 산정
          </Button>
        </>
      )}

      <div className={FIELD_GRID}>
        <UnitField label="습윤 유량 (Q)" unit="m³/hr" readOnly value={display(quantity?.quantity)} />
        <UnitField label={<>표준 유량 (Q<sub>s</sub>)</>} unit="Sm³/hr" readOnly value={display(quantity?.standardQuantity)} />
      </div>
    </SectionAccordion>
  );
};
