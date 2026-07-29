import { Plus, Sparkles, X } from "lucide-react";

import type { SheetCalcPreview } from "@entities/schedule";
import { toNumberOrNull } from "@shared/lib";
import { SectionAccordion } from "@shared/ui/accordion";
import { Button } from "@shared/ui/buttons";
import { TableLabelCell, TableInputCell, TableResultCell, TableSelectCell } from "@shared/ui/table";

import type { ParticleForm, SamplingPointForm } from "../../model/types";

interface Props {
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

// 구버전과 동일한 전치 구조: 행 = 항목, 열 = 측정점(1..n지점) + 평균.
export const SamplingPointSection = ({
  isParticle, points, particle, preview, nozzleOptions, editable,
  onPointChange, onAddPoint, onRemovePoint, onParticleChange, onOpenNozzleRecommend,
}: Props) => {
  const n = points.length;
  const wide = n + 1;                       // 지점 열 + 평균 열 (라벨 제외)
  const quantity = preview?.quantity ?? null;
  const particleCalc = preview?.particle ?? null;
  const pointCalc = (i: number) => preview?.points[i] ?? null;

  // 지점별 입력 행 렌더 헬퍼
  const inputRow = (
    label: React.ReactNode,
    field: keyof SamplingPointForm,
    unit: React.ReactNode,
    avg: string | number,
    step?: number,
  ) => (
    <tr>
      <TableLabelCell>{label}</TableLabelCell>
      {points.map((p, i) => (
        <TableInputCell key={i} type="number" value={p[field]} unit={unit} step={step}
          onChange={(v) => onPointChange(i, { [field]: v })} disabled={!editable} />
      ))}
      <TableResultCell value={avg ?? "-"} />
    </tr>
  );

  // 지점별 계산 결과 행 렌더 헬퍼
  const resultRow = (
    label: React.ReactNode,
    value: (i: number) => number | null | undefined,
    avg: string | number,
  ) => (
    <tr>
      <TableLabelCell>{label}</TableLabelCell>
      {points.map((_, i) => (
        <TableResultCell key={i} value={display(value(i))} />
      ))}
      <TableResultCell value={avg ?? "-"} />
    </tr>
  );

  return (
    <SectionAccordion title="측정점정보" defaultOpen>
      <div className="border-x border-b border-border rounded-b-nav">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <p className="text-caption text-muted-foreground">
            연도 단면적 <span className="font-semibold text-foreground">{display(quantity?.area)}</span> m² ·
            규정 요구 측정점 수 <span className="font-semibold text-foreground">{display(preview?.samplingPointCnt)}</span>
          </p>
          {editable && (
            <Button type="button" variant="outline" size="sm" onClick={onAddPoint}>
              <Plus size={14} className="mr-1" />측정점 추가
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: `${140 + wide * 90}px` }}>
            <tbody>
              {/* 헤더: 지점 번호 (+ 삭제) */}
              <tr>
                <TableLabelCell>측정점</TableLabelCell>
                {points.map((_, i) => (
                  <th key={i} scope="col"
                    className="bg-muted border border-border p-1 text-center text-label text-foreground whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      {i + 1} 지점
                      {editable && n > 1 && (
                        <button type="button" onClick={() => onRemovePoint(i)}
                          className="text-muted-foreground hover:text-destructive" aria-label={`${i + 1}지점 삭제`}>
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  </th>
                ))}
                <TableLabelCell>평균</TableLabelCell>
              </tr>

              {inputRow(<>배출가스온도 (T<sub>s</sub>, °C)</>, "Ts", "°C",
                display(quantity?.avgTg == null ? null : quantity.avgTg - 273), 0.1)}
              {inputRow(<>동압 (ΔP, mmH₂O)</>, "Pv", "mmH₂O", display(quantity?.avgPv), 0.1)}
              {inputRow(<>정압 (P<sub>s</sub>, mmH₂O)</>, "Ps", "mmH₂O", display(quantity?.avgPs), 0.1)}

              {isParticle && (
                <>
                  {inputRow("DGM 입구온도 (°C)", "inTm", "°C", avgOf(points.map((p) => p.inTm)), 0.1)}
                  {inputRow("DGM 출구온도 (°C)", "outTm", "°C", avgOf(points.map((p) => p.outTm)), 0.1)}

                  <tr>
                    <TableLabelCell>노즐 추천</TableLabelCell>
                    <td colSpan={wide} className="border border-border p-1.5">
                      <Button type="button" variant="outline" size="sm" onClick={onOpenNozzleRecommend} disabled={!editable}>
                        <Sparkles size={14} className="mr-1" />적정 노즐사이즈 산정
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <TableLabelCell>노즐 사이즈 (cm)</TableLabelCell>
                    <TableSelectCell colSpan={wide} value={particle.nozzleSize} options={nozzleOptions}
                      placeholder="노즐 선택" onChange={(v) => onParticleChange({ nozzleSize: v })} disabled={!editable} />
                  </tr>
                  <tr>
                    <TableLabelCell>피토우관 계수 (C<sub>p</sub>)</TableLabelCell>
                    <TableResultCell colSpan={wide} value={display(quantity?.Cp)} />
                  </tr>
                  <tr>
                    <TableLabelCell>배출가스 밀도 (ρ)</TableLabelCell>
                    <TableResultCell colSpan={wide} value={display(quantity?.gasDensity)} unit="kg/m³" />
                  </tr>

                  {resultRow(<>배출가스 유속 (V<sub>s</sub>, m/s)</>, (i) => pointCalc(i)?.Vs, display(quantity?.Vs))}
                  {resultRow("오리피스 차압 (ΔH, mmH₂O)", (i) => pointCalc(i)?.orificeDp, display(particleCalc?.avgOrificeDp))}
                  {resultRow("K-Factor", (i) => pointCalc(i)?.kFactor, display(particleCalc?.avgKFactor))}

                  <tr>
                    <TableLabelCell>채취 시작시간</TableLabelCell>
                    <TableInputCell type="time" colSpan={wide} value={particle.samplingStartTime}
                      onChange={(v) => onParticleChange({ samplingStartTime: v })} disabled={!editable} />
                  </tr>
                  <tr>
                    <TableLabelCell>채취 종료시간</TableLabelCell>
                    {/* 시작시간 + Σ채취시간으로 자동 계산 */}
                    <TableResultCell colSpan={wide} value={particle.samplingEndTime || "-"} />
                  </tr>

                  {inputRow("채취시간 (min)", "samplingTime", "min", display(particleCalc?.totalSamplingTime))}
                  {inputRow("흡입량 전 (m³)", "beforeVm", "m³", "-", 0.00001)}
                  {inputRow("흡입량 후 (m³)", "afterVm", "m³", "-", 0.00001)}
                  {resultRow(<>채취량 (V<sub>m</sub>, m³)</>, (i) => pointCalc(i)?.Vm, display(particleCalc?.totalVm))}
                  {resultRow("등속흡입계수 (I, %)", (i) => pointCalc(i)?.isokineticRatio, display(particleCalc?.avgIsokineticRatio))}
                  {inputRow("진공게이지압 (mmHg)", "vacuumGaugePressure", "mmHg", "-")}
                  {inputRow("최종임핀저 출구온도 (°C)", "finalImpingerTemperature", "°C", "-", 0.1)}
                </>
              )}

              <tr>
                <TableLabelCell>습윤 유량 (Q)</TableLabelCell>
                <TableResultCell colSpan={wide} value={display(quantity?.quantity)} unit="m³/hr" />
              </tr>
              <tr>
                <TableLabelCell>표준 유량 (Q<sub>s</sub>)</TableLabelCell>
                <TableResultCell colSpan={wide} value={display(quantity?.standardQuantity)} unit="Sm³/hr" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </SectionAccordion>
  );
};
