import { Fragment, type ReactNode } from "react";
import { ArrowDownToLine, Plus, Sparkles, X } from "lucide-react";

import type { SheetCalcPreview } from "@entities/schedule";
import { toNumberOrNull } from "@shared/lib";
import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";
import { Button, IconButton } from "@shared/ui/buttons";
import { UnitField, CalcResultRow } from "@shared/ui/form";
import { TableLabelCell, TableInputCell, TableResultCell } from "@shared/ui/table";

import { PARTICLE_HINT, POINT_HINT, POINT_RESULT_HINT } from "../../model/field-hints";
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
  onCopyPreviousPoint: (index: number) => void;
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

/** 지점 카드 안의 그룹 소제목 — 접히지 않는 구분 라벨(피그마의 muted 소제목). */
const GroupLabel = ({ children }: { children: ReactNode }) => (
  <p className="text-label text-muted-ink">{children}</p>
);

interface PointField {
  field: keyof SamplingPointForm;
  label: ReactNode;
  /** 라벨이 JSX·조합 문자열이라 그대로 못 쓰는 자리 — 도움말 아이콘의 접근성 이름 */
  name: string;
  unit: string;
  step?: number;
}

/** 유량 정보 — 모든 시트가 입력한다(유속·유량 계산의 입력). */
const FLOW_FIELDS: PointField[] = [
  { field: "Ts", label: <span>배출가스온도 (T<sub>s</sub>)</span>, name: "배출가스온도", unit: "°C", step: 0.1 },
  { field: "Pv", label: <>동압 (ΔP)</>, name: "동압", unit: "mmH₂O", step: 0.1 },
  { field: "Ps", label: <span>정압 (P<sub>s</sub>)</span>, name: "정압", unit: "mmH₂O", step: 0.1 },
];

// 등속흡인 정보 — 입자상 전용. 채취량(Vm)이 흡입량과 진공게이지압 사이에 오는 시안 순서를 지키려고
// 앞·뒤 두 덩이로 나눈다.
const ISOKINETIC_FIELDS_HEAD: PointField[] = [
  { field: "inTm", label: "DGM 입구온도", name: "DGM 입구온도", unit: "°C", step: 0.1 },
  { field: "outTm", label: "DGM 출구온도", name: "DGM 출구온도", unit: "°C", step: 0.1 },
  { field: "samplingTime", label: "채취시간", name: "채취시간", unit: "min" },
  { field: "beforeVm", label: "흡입량 전", name: "흡입량 전", unit: "m³", step: 0.00001 },
  { field: "afterVm", label: "흡입량 후", name: "흡입량 후", unit: "m³", step: 0.00001 },
];

const ISOKINETIC_FIELDS_TAIL: PointField[] = [
  { field: "vacuumGaugePressure", label: "진공게이지압", name: "진공게이지압", unit: "mmHg" },
  { field: "finalImpingerTemperature", label: "최종임핀저 출구온도", name: "최종임핀저 출구온도", unit: "°C", step: 0.1 },
];

/**
 * 측정점 정보.
 *
 * 입력은 시안대로 세 덩이다 — 지점과 무관한 **공통 값**, 지점별 **유량 정보**·**등속흡인 정보**.
 * 이 섹션만 반응형 예외다: 지점별 카드(모바일)와 행=항목·열=측정점인 전치 테이블(md 이상)을
 * 함께 둔다. 다열 그리드로 펴면 "지점 간 값 비교"라는 이 표의 목적이 사라지기 때문이다.
 */
export const SamplingPointSection = ({
  isParticle, points, particle, preview, nozzleOptions, editable,
  onPointChange, onAddPoint, onRemovePoint, onCopyPreviousPoint,
  onParticleChange, onOpenNozzleRecommend,
  ...shell
}: Props) => {
  const n = points.length;
  const wide = n + 1;                       // 지점 열 + 평균 열 (라벨 제외)
  const quantity = preview?.quantity ?? null;
  const particleCalc = preview?.particle ?? null;
  const pointCalc = (i: number) => preview?.points[i] ?? null;

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

  interface PointResult {
    label: ReactNode;
    name: string;                           // 라벨이 JSX 라 문자열이 필요한 자리(도움말 접근성 이름)
    hint: string;
    unit?: string;
    value: (i: number) => number | null | undefined;
    avg: string;
  }

  // 유량 자동계산 — 피토우관 계수·배출가스 밀도는 시트 상수라 지점마다 같은 값이 나온다(장비·가스 조건).
  const flowResults: PointResult[] = [
    {
      label: <span>배출가스 유속 (V<sub>s</sub>)</span>, name: "배출가스 유속", hint: POINT_RESULT_HINT.Vs,
      value: (i) => pointCalc(i)?.Vs, avg: display(quantity?.Vs),
    },
    ...(isParticle
      ? [
        {
          label: <span>피토우관 계수 (C<sub>p</sub>)</span>, name: "피토우관 계수", hint: PARTICLE_HINT.Cp,
          value: () => quantity?.Cp, avg: display(quantity?.Cp),
        },
        {
          label: "배출가스 밀도 (ρ)", name: "배출가스 밀도", hint: PARTICLE_HINT.gasDensity, unit: "kg/m³",
          value: () => quantity?.gasDensity, avg: display(quantity?.gasDensity),
        },
      ]
      : []),
  ];

  // 등속흡인 자동계산 (입자상 전용)
  const isokineticResults: PointResult[] = [
    {
      label: "오리피스 차압 (ΔH)", name: "오리피스 차압", hint: POINT_RESULT_HINT.orificeDp,
      value: (i) => pointCalc(i)?.orificeDp, avg: display(particleCalc?.avgOrificeDp),
    },
    {
      label: "K-Factor", name: "K-Factor", hint: POINT_RESULT_HINT.kFactor,
      value: (i) => pointCalc(i)?.kFactor, avg: display(particleCalc?.avgKFactor),
    },
    {
      label: "등속흡입계수 (I, %)", name: "등속흡입계수", hint: POINT_RESULT_HINT.isokineticRatio,
      value: (i) => pointCalc(i)?.isokineticRatio, avg: display(particleCalc?.avgIsokineticRatio),
    },
  ];

  // 데스크탑 전치 테이블의 행 구성 — 모바일 카드와 같은 그룹 순서를 쓴다.
  const tableGroups: { label: string; fields: PointField[]; results: PointResult[] }[] = [
    { label: "유량 정보", fields: FLOW_FIELDS, results: flowResults },
    ...(isParticle
      ? [{
        label: "등속흡인 정보",
        fields: [...ISOKINETIC_FIELDS_HEAD, ...ISOKINETIC_FIELDS_TAIL],
        results: [
          {
            label: <span>채취량 (V<sub>m</sub>)</span>, name: "채취량", hint: POINT_RESULT_HINT.Vm,
            value: (i: number) => pointCalc(i)?.Vm, avg: display(particleCalc?.totalVm),
          },
          ...isokineticResults,
        ],
      }]
      : []),
  ];

  const inputField = (f: PointField, i: number) => (
    <UnitField
      key={String(f.field)}
      label={f.label} required unit={f.unit} type="number" step={f.step}
      hint={POINT_HINT[f.field]}
      hintLabel={`${f.name} 설명`}
      value={points[i][f.field]} disabled={!editable}
      onChange={(v) => onPointChange(i, { [f.field]: v })}
    />
  );

  const resultField = (r: PointResult, i: number, key: number) => (
    <UnitField
      key={key} label={r.label} readOnly unit={r.unit} value={display(r.value(i))}
      hint={r.hint} hintLabel={`${r.name} 설명`}
    />
  );

  return (
    <SectionAccordion
      {...shell}
      title="측정점 정보"
      description="지점별 측정값을 입력하면 유속·채취량·등속흡입계수가 자동으로 계산됩니다."
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col text-body-3">
          <p className="flex items-center gap-1 text-body-3 text-ink">
            연도 단면적 <span className="text-body-4 text-primary">{display(quantity?.area)}</span>m³
          </p>
          <p className="flex items-center gap-1 text-body-3 text-ink">
            규정 요구 측정점 수 <span className="text-body-4 text-primary">{display(preview?.samplingPointCnt)}</span>
          </p>
        </div>
        {editable && (
          <Button type="button" variant="outline" size="sm" onClick={onAddPoint}>
            <Plus size={14} />측정점 추가
          </Button>
        )}
      </div>

      {/* 공통 값 — 지점과 무관한 시트 단위 입력·결과. 지점 카드보다 먼저 채우는 순서라 위에 둔다. */}
      <SubAccordion title="공통 값" defaultOpen>
        <div className="space-y-3">
          {isParticle && (
            <>
              <Button
                type="button" variant="outline" className="w-full"
                onClick={onOpenNozzleRecommend} disabled={!editable}
              >
                <Sparkles size={14} />적정 노즐사이즈 산정
              </Button>

              <div className={FIELD_GRID}>
                {/* 옵션 라벨이 이미 "3 cm" 형태라 단위 박스를 따로 두지 않는다. */}
                <UnitField
                  label="노즐 사이즈 (cm)" required options={nozzleOptions} placeholder="노즐 선택"
                  hint={PARTICLE_HINT.nozzleSize}
                  value={particle.nozzleSize} disabled={!editable}
                  onChange={(v) => onParticleChange({ nozzleSize: v })}
                />
                {/* 종료시각은 시작시각 + Σ채취시간으로 자동 계산되므로 입력창 없이 보조 행으로 붙인다. */}
                <UnitField
                  label="채취 시작시각" required type="time"
                  hint={PARTICLE_HINT.samplingStartTime}
                  value={particle.samplingStartTime} disabled={!editable}
                  onChange={(v) => onParticleChange({ samplingStartTime: v })}
                  helper={<CalcResultRow label="채취 종료시각" value={particle.samplingEndTime || "-"} />}
                />
              </div>
            </>
          )}

          <div className={FIELD_GRID}>
            <UnitField
              label="습윤 유량 (Q)" unit="m³/hr" readOnly value={display(quantity?.quantity)}
              hint={PARTICLE_HINT.quantity}
            />
            <UnitField
              label={<span>표준 유량 (Q<sub>s</sub>)</span>} unit="Sm³/hr" readOnly
              value={display(quantity?.standardQuantity)}
              hint={PARTICLE_HINT.standardQuantity} hintLabel="표준 유량 설명"
            />
          </div>
        </div>
      </SubAccordion>

      {/* 모바일 — 지점별 카드 */}
      <div className="space-y-3 md:hidden">
        {points.map((_, i) => (
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
            {/* 앞 지점과 조건이 비슷한 경우가 많아 값을 통째로 복사한 뒤 다른 항목만 고치게 한다. */}
            {i > 0 && editable && (
              <Button
                type="button" variant="outline" className="mb-4 w-full"
                onClick={() => onCopyPreviousPoint(i)}
              >
                <ArrowDownToLine size={14} />전 지점 값 불러오기
              </Button>
            )}

            <div className="space-y-3">
              <GroupLabel>유량 정보</GroupLabel>
              <div className="grid grid-cols-1 gap-y-3">
                {FLOW_FIELDS.map((f) => inputField(f, i))}
              </div>

              <GroupLabel>자동계산 데이터</GroupLabel>
              <div className="grid grid-cols-1 gap-y-3">
                {flowResults.map((r, ri) => resultField(r, i, ri))}
              </div>
            </div>

            {isParticle && (
              <div className="mt-4 space-y-3 border-t border-rule pt-4">
                <GroupLabel>등속흡인 정보</GroupLabel>
                <div className="grid grid-cols-1 gap-y-3">
                  {ISOKINETIC_FIELDS_HEAD.map((f) => inputField(f, i))}
                  <CalcResultRow
                    label={<span>채취량 (V<sub>m</sub>)</span>}
                    value={display(pointCalc(i)?.Vm)}
                  />
                  {ISOKINETIC_FIELDS_TAIL.map((f) => inputField(f, i))}
                </div>

                <GroupLabel>자동계산 데이터</GroupLabel>
                <div className="grid grid-cols-1 gap-y-3">
                  {isokineticResults.map((r, ri) => resultField(r, i, ri))}
                </div>
              </div>
            )}
          </SubAccordion>
        ))}

        <SubAccordion title="평균 자동계산값">
          {tableGroups.map((group, gi) => (
            <div
              key={group.label}
              className={gi === 0 ? "space-y-3" : "mt-4 space-y-3 border-t border-rule pt-4"}
            >
              <GroupLabel>{group.label}</GroupLabel>
              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                {group.fields.map((f) => (
                  <UnitField
                    key={String(f.field)}
                    label={<>{f.label} 평균</>} unit={f.unit} readOnly value={averageOf(f.field)}
                  />
                ))}
              </div>

              <GroupLabel>자동계산 데이터</GroupLabel>
              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                {group.results.map((r, ri) => (
                  <UnitField key={ri} label={<>{r.label} 평균</>} unit={r.unit} readOnly value={r.avg} />
                ))}
              </div>
            </div>
          ))}
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
                    {editable && i > 0 && (
                      <button type="button" onClick={() => onCopyPreviousPoint(i)}
                        className="text-muted-ink hover:text-brand-primary" aria-label={`${i + 1}지점에 전 지점 값 불러오기`}>
                        <ArrowDownToLine size={12} />
                      </button>
                    )}
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

            {tableGroups.map((group) => (
              <Fragment key={group.label}>
                <tr>
                  <th scope="colgroup" colSpan={wide + 1}
                    className="bg-canvas border border-rule px-2 py-1 text-left text-label text-muted-ink">
                    {group.label}
                  </th>
                </tr>

                {group.fields.map((f) => (
                  <tr key={String(f.field)}>
                    <TableLabelCell hint={POINT_HINT[f.field]} hintLabel={`${f.name} 설명`}>
                      {f.label} ({f.unit})
                    </TableLabelCell>
                    {points.map((p, i) => (
                      <TableInputCell key={i} type="number" value={p[f.field]} unit={f.unit} step={f.step}
                        onChange={(v) => onPointChange(i, { [f.field]: v })} disabled={!editable} />
                    ))}
                    <TableResultCell value={averageOf(f.field)} />
                  </tr>
                ))}

                {group.results.map((r, ri) => (
                  <tr key={ri}>
                    <TableLabelCell hint={r.hint} hintLabel={`${r.name} 설명`}>{r.label}</TableLabelCell>
                    {points.map((_, i) => (
                      <TableResultCell key={i} value={display(r.value(i))} />
                    ))}
                    <TableResultCell value={r.avg} />
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </SectionAccordion>
  );
};
