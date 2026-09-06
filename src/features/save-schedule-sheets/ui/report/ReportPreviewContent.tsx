import type {
  ParticleSamplerSpec, ScheduleDetail, ScheduleSnapshot, SheetCalcExternals, SheetCalcPreview,
} from "@entities/schedule";
import { toNumberOrNull, formatNumber, toNumber, formatDateDot } from "@shared/lib";
import {
  MEASUREMENT_CATEGORY_LABEL, WEATHER_CONDITION_LABEL, WIND_DIRECTION_LABEL,
} from "@shared/config";
import type { WeatherCondition, WindDirection } from "@shared/model";
import { TableLabelCell } from "@shared/ui/table";

import type { ScheduleBasicInfoForm, SheetForm } from "../../model/types";
import {
  calcMoistureSamplingMinutes, getGasAnalyzerEndTime, getThcAnalyzerEndTime,
} from "../../model/derived-times";
import { calcWallDistances, getSectionRadiusCm } from "../../model/wall-distances";
import { StackCrossSection } from "./StackCrossSection";

// 종이 기록지(대기시료 채취기록지) 재현 — 표시 전용. 구버전 ReportPreviewContent 이식.

/**
 * 기록지의 **최소** 폭(px). 23열이 뭉개지지 않는 하한이며, 이 값보다 좁혀서 그리지 않는다.
 * 화면이 좁을 때 줄이는 것은 뷰어(`DocumentViewerDialog`)의 배율이 맡는다 —
 * 표를 접거나 늘리면 종이 기록지와 대조할 수가 없다.
 *
 * 실제 폭은 이보다 넓을 수 있다. 머리 셀(`TableLabelCell`)이 `whitespace-nowrap` 이라
 * 표의 min-content 가 이 값을 넘기기 때문이며, 그 실측은 뷰어가 한다.
 */
export const REPORT_DOCUMENT_WIDTH = 800;

interface Props {
  sheet: SheetForm;
  preview: SheetCalcPreview | null;
  /** 계획 메타(관리번호·채취일자) — 스냅샷에는 사본이 없어 응답 최상위에서 받는다. */
  schedule: ScheduleDetail | null;
  snapshot: ScheduleSnapshot;
  basicInfoForm: ScheduleBasicInfoForm;  // 저장 전 입력값을 반영하려 스냅샷 대신 폼 값을 쓴다
  externals: SheetCalcExternals;
}

// 기록지 값 셀
const VCell = ({
  children, colSpan, rowSpan,
}: { children?: React.ReactNode; colSpan?: number; rowSpan?: number }) => (
  <td colSpan={colSpan} rowSpan={rowSpan}
    className="border border-border p-1 text-center align-middle bg-surface">
    {children}
  </td>
);

const hrToMin = (v: number | null | undefined): number => v == null || Number.isNaN(v) ? 0 : v/60;

const fmt = (v: number | null | undefined, scale: number): string =>
  v == null || Number.isNaN(v) ? "" : v.toFixed(scale);

const timeRange = (start: string | null | undefined, end: string | null | undefined): string =>
  `${start ? start.slice(0, 5) : "--:--"} ~ ${end ? end.slice(0, 5) : "--:--"}`;

// 표시 전용 평균 (입력된 값만)
const avgOf = (values: string[]): number | null => {
  const nums = values.map(toNumberOrNull).filter((v): v is number => v !== null);
  if (nums.length === 0) return null;
  return nums.reduce((a, v) => a + v, 0) / nums.length;
};

const GAS_ROW_COUNT = 8;

export const ReportPreviewContent = ({
  sheet, preview, schedule, snapshot, basicInfoForm, externals,
}: Props) => {
  const { client } = snapshot;
  const stack = client.workplace.stack;
  const preventionName = stack.preventions?.[0]?.name ?? "방지시설 설치의무 면제";
  const preventionCapacity = stack.preventions?.[0]?.capacity ?? "-";

  const isParticle = sheet.category !== "GAS";
  const points = sheet.samplingPoints;
  const quantity = preview?.quantity ?? null;
  const particleCalc = preview?.particle ?? null;

  const samplerSpec = snapshot.team?.equipments?.find((e) => e.type === "PARTICLE_SAMPLER")?.spec as
    | ParticleSamplerSpec | null | undefined;

  // 연도 직경·벽면거리 — 벽면거리 행과 단면 도형이 같은 값을 쓴다
  const section = {
    shape: stack.shape,
    horizontalLength: stack.horizontalLength,
    verticalLength: stack.verticalLength,
  };
  const radiusCm = getSectionRadiusCm(section);
  const wallDistances = calcWallDistances(section, points.length);
  const stackLength = stack.shape === "CIRCULAR"
    ? (stack.horizontalLength != null ? stack.horizontalLength.toFixed(3) : "")
    : (stack.horizontalLength != null && stack.verticalLength != null
      ? `${stack.horizontalLength.toFixed(3)} × ${stack.verticalLength.toFixed(3)}` : "");

  // 평균값 (기록지 평균행)
  const avgTs = quantity?.avgTg == null ? null : quantity.avgTg - 273;
  const avgTmC = preview?.avgTm == null ? null : preview.avgTm - 273;   // 가스미터 온도 (°C)
  const avgVacuum = avgOf(points.map((p) => p.vacuumGaugePressure));
  const avgFinalImpinger = avgOf(points.map((p) => p.finalImpingerTemperature));

  // 총 채취량(m³) — 지점별 (채취 후 − 채취 전) 의 합. 마지막 지시량 자체가 아니다.
  const totalVm = particleCalc?.totalVm ?? null;

  // 가스흡입량 — 총 채취량을 표준상태로 환산
  const suctionVolume = (() => {
    if (totalVm == null || avgTmC == null || preview?.weather.pa == null || particleCalc?.avgOrificeDp == null) return null;
    const deltaHmmHg = particleCalc.avgOrificeDp / 13.6;
    return totalVm * (273 / (273 + avgTmC)) * ((preview.weather.pa + deltaHmmHg) / 760);
  })();

  // 흡입유량(L/min) — 총 채취량 ÷ 총 채취시간
  const suctionFlowRate = (() => {
    const minutes = particleCalc?.totalSamplingTime ?? null;
    if (totalVm == null || minutes == null || minutes === 0) return null;
    return (totalVm * 1000) / minutes;
  })();

  const startVolume = toNumberOrNull(points[0]?.beforeVm ?? "");
  const nozzleSize = toNumberOrNull(sheet.particle.nozzleSize);
  const nozzleArea = nozzleSize == null ? null : (Math.PI * nozzleSize * nozzleSize) / 4;

  // 수분 섹션 파생값 — 채취시간은 흡입량 ÷ 흡인유속이라 입력칸 없이 계산한다
  const moistureVolume = preview?.moisture.vm_g ?? null;
  const moistureSamplingTime = calcMoistureSamplingMinutes(sheet.moisture, preview);

  // 가스상 8행 — 종이 서식의 칸 수에 맞춘 고정 행이다. 시료가 없으면 빈 칸으로 남는다.
  // 측정항목과 짝지어 두었던 코드가 있었으나 인덱스로 맞춘 것이라 통칭 행(VOCs 1행 ↔ 항목 N건)에서
  // 애초에 어긋났고 쓰이지도 않아 걷어냈다. 필요해지면 sample.pollutantIds 로 되짚어야 한다.
  const gasRows = Array.from({ length: GAS_ROW_COUNT }, (_, i) => ({
    sample: sheet.samples[i] ?? null,
  }));

  const weatherLabel = sheet.weather.weatherCondition
    ? WEATHER_CONDITION_LABEL[sheet.weather.weatherCondition as WeatherCondition] : "-";
  const windLabel = sheet.weather.windDirection
    ? WIND_DIRECTION_LABEL[sheet.weather.windDirection as WindDirection] : "-";

  return (
    /* 종이는 표를 정확히 감싼다 — 폭을 상수에 묶어 두면 머리 셀(whitespace-nowrap)이 밀어낸
       만큼 표만 오른쪽으로 삐져나가 좌우가 어긋난다. 좁은 화면에 맞춰 줄이는 것은 뷰어의 배율이 맡는다.
       bg-surface 인 이유 — `--background` 는 뷰어 배경(`--canvas`)과 같은 값이라 종이가 보이지 않는다. */
    <div
      className="bg-surface p-4"
      style={{ minWidth: REPORT_DOCUMENT_WIDTH, width: "min-content" }}
    >
      <h1 className="mb-3 text-center text-h1 tracking-widest">
        대기시료 채취기록지
      </h1>

      <table className="w-full border-collapse text-caption leading-tight">
          {/* 총 23 컬럼 */}
          <colgroup>
            {Array.from({ length: 19 }, (_, i) => <col key={i} style={{ width: "4%" }} />)}
            {Array.from({ length: 4 }, (_, i) => <col key={i + 19} style={{ width: "6%" }} />)}
          </colgroup>
          <tbody>

            {/* ── 접수번호 행 ─────────────────────────────── */}
            <tr>
              <TableLabelCell colSpan={15}> </TableLabelCell>
              <TableLabelCell colSpan={3}>접수번호</TableLabelCell>
              <VCell colSpan={3}>{schedule?.referenceNumber ?? "-"}</VCell>
              <VCell colSpan={2}>{MEASUREMENT_CATEGORY_LABEL[sheet.category]}</VCell>
            </tr>

            {/* ── 업체명 / 굴뚝단면 / 기상 (5행 묶음) ────── */}
            <tr>
              <TableLabelCell colSpan={4}>업 체 명</TableLabelCell>
              <VCell colSpan={5}>{client.workplace.name}</VCell>
              <VCell rowSpan={5} colSpan={6}>
                <div className="mb-1">굴뚝높이: {formatNumber(stack.height, {minDecimals:1})} m</div>
                <div className="mb-1">굴뚝단면 및 측정점 배열</div>
                <StackCrossSection
                  shape={stack.shape}
                  orientation={stack.orientation}
                  wallDistances={wallDistances}
                  radiusCm={radiusCm}
                  horizontalLength={stack.horizontalLength}
                  verticalLength={stack.verticalLength}
                />
              </VCell>
              <TableLabelCell colSpan={3}>대기온도</TableLabelCell>
              <VCell colSpan={2}>{formatNumber(sheet.weather.temperature, {minDecimals:1})} <i>°C</i></VCell>
              <TableLabelCell colSpan={2}>습 도</TableLabelCell>
              <VCell colSpan={1}>{formatNumber(sheet.weather.humidity, {minDecimals:1})} <i>%</i></VCell>
            </tr>
            <tr>
              <TableLabelCell colSpan={4}>배 출 시 설</TableLabelCell>
              <VCell colSpan={5}>{stack.semsNumber}({stack.name}) <sub><i>{formatNumber(preventionCapacity)} Sm³/min</i></sub></VCell>
              <TableLabelCell colSpan={3}>풍 향</TableLabelCell>
              <VCell colSpan={2}>{windLabel}</VCell>
              <TableLabelCell colSpan={2}>날 씨</TableLabelCell>
              <VCell colSpan={1}>{weatherLabel}</VCell>
            </tr>
            <tr>
              <TableLabelCell colSpan={4}>방지시설명</TableLabelCell>
              <VCell colSpan={5}>{preventionName}</VCell>
              <TableLabelCell colSpan={3}>풍 속</TableLabelCell>
              <VCell colSpan={2}>{formatNumber(sheet.weather.windSpeed, {minDecimals:1})} <i>m/s</i></VCell>
              <TableLabelCell colSpan={2}>피토관계수</TableLabelCell>
              <VCell colSpan={1}>{quantity?.Cp?.toFixed(3) ?? "-"}</VCell>
            </tr>
            <tr>
              <TableLabelCell colSpan={4}>측 정 일</TableLabelCell>
              <VCell colSpan={5}>{formatDateDot(schedule?.sampledAt)}</VCell>
              <TableLabelCell colSpan={5}>측정공 위치의 기압</TableLabelCell>
              <VCell colSpan={3}>{fmt(preview?.weather.pa, 1) || "-"} <i>mmHg</i></VCell>
            </tr>
            <tr>
              <TableLabelCell colSpan={4}>채 취 시 간</TableLabelCell>
              <VCell colSpan={5}>{timeRange(basicInfoForm.samplingStartedAt, basicInfoForm.samplingEndedAt)}</VCell>
              <TableLabelCell colSpan={3}>ΔH</TableLabelCell>
              <VCell colSpan={2}>{externals.deltaH ?? 46}</VCell>
              <TableLabelCell colSpan={2}>YD</TableLabelCell>
              <VCell colSpan={1}>{samplerSpec?.yd.toFixed(4) ?? "-"}</VCell>
            </tr>

            {/* ── 연도 직경 / 벽면거리 / 가스흡입량 ──────── */}
            <tr>
              <TableLabelCell colSpan={4}>연도 직경(m)</TableLabelCell>
              <VCell colSpan={5}>{stackLength || "-"}</VCell>
              <TableLabelCell colSpan={6}>연도 벽면으로부터 (cm)</TableLabelCell>
              <TableLabelCell colSpan={3}>가스흡입량</TableLabelCell>
              <VCell colSpan={5}>{fmt(suctionVolume, 3) || "-"} <i>Sm³</i></VCell>
            </tr>

            <tr>
              <TableLabelCell colSpan={4}>연도 면적(m²)</TableLabelCell>
              <VCell colSpan={5}>{fmt(quantity?.area, 3) || "-"}</VCell>
              <TableLabelCell colSpan={2}>1지점</TableLabelCell>
              <VCell colSpan={4}>{wallDistances[0]?.toFixed(1) ?? ""}</VCell>
              <TableLabelCell colSpan={3}>O₂ (%)</TableLabelCell>
              <VCell colSpan={2}>{fmt(preview?.exhaustGas.o2Avg, 1)}</VCell>
              <TableLabelCell colSpan={2}>CO₂ (%)</TableLabelCell>
              <VCell>{fmt(preview?.exhaustGas.co2Avg, 1)}</VCell>
            </tr>

            <tr>
              <TableLabelCell colSpan={4}>측정여지 번호</TableLabelCell>
              <VCell colSpan={5}>
                {isParticle ? `측정 ${sheet.particle.thimbleFilter}, 바탕 ${sheet.particle.bgThimbleFilter}` : null}
              </VCell>
              <TableLabelCell colSpan={2}>2지점</TableLabelCell>
              <VCell colSpan={4}>{wallDistances[1]?.toFixed(1) ?? ""}</VCell>
              <TableLabelCell colSpan={3}>누출검사 확인 (mmHg)</TableLabelCell>
              <VCell colSpan={2}>{isParticle ? 381 : "-"}</VCell>
              <TableLabelCell colSpan={2}>배출가스 정압 (mmHg)</TableLabelCell>
              <VCell>{quantity?.avgPs == null ? "-" : (Math.round((quantity.avgPs / 13.6) * 100) / 100).toFixed(2)}</VCell>
            </tr>

            <tr>
              <TableLabelCell colSpan={4}>기술책임자 확인</TableLabelCell>
              <VCell colSpan={5}>(서명)</VCell>
              <TableLabelCell colSpan={2}>3지점</TableLabelCell>
              <VCell colSpan={4}>{wallDistances[2]?.toFixed(1) ?? ""}</VCell>
              <TableLabelCell colSpan={5}>흡인노즐 (mm)</TableLabelCell>
              <VCell colSpan={3}>{fmt(toNumber(sheet.particle.nozzleSize) * 10, 2) || "-"}</VCell>
            </tr>

            <tr>
              <TableLabelCell colSpan={4}>시료채취자 확인</TableLabelCell>
              <VCell colSpan={5}>{basicInfoForm.mentorName || "-"} (서명)<br />{basicInfoForm.menteeName || "-"} (서명)</VCell>
              <TableLabelCell colSpan={2}>4지점</TableLabelCell>
              <VCell colSpan={4}>{wallDistances[3]?.toFixed(1) ?? ""}</VCell>
              <TableLabelCell colSpan={5}>노즐단면적 (cm²)</TableLabelCell>
              <VCell colSpan={3}>{fmt(nozzleArea, 3) || "-"}</VCell>
            </tr>

            <tr>
              <TableLabelCell colSpan={4}>환경기술인</TableLabelCell>
              <VCell colSpan={5}>{basicInfoForm.facilityManager || "-"} (서명)</VCell>
              <TableLabelCell colSpan={2}>5지점</TableLabelCell>
              <VCell colSpan={4}>{wallDistances[4]?.toFixed(1) ?? ""}</VCell>
              <TableLabelCell colSpan={5}>등속흡인계수 (%)</TableLabelCell>
              <VCell colSpan={3}>{fmt(particleCalc?.avgIsokineticRatio, 1)}</VCell>
            </tr>

            {/* ════════ [입자상 물질] ════════ */}
            <tr>
              <TableLabelCell colSpan={23}>
                [입자상 물질] &nbsp;&nbsp; 측정시간 (&nbsp;
                {timeRange(sheet.particle.samplingStartTime, sheet.particle.samplingEndTime)}
                &nbsp;)
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                흡입유량 : {formatNumber(suctionFlowRate, {maxDecimals:1})} L/min
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                유량 : {formatNumber(hrToMin(quantity?.standardQuantity), {maxDecimals:1})} Sm³/min
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {/* 이 행은 colSpan 23 짜리 nowrap 셀이라 표 폭을 좌우한다 —
                    포맷을 거치지 않으면 raw float 한 줄로 문서가 통째로 넓어진다 */}
                유속 : {formatNumber(quantity?.Vs, {maxDecimals:1})} m/s
              </TableLabelCell>
            </tr>

            <tr>
              <TableLabelCell rowSpan={2} colSpan={2}>채취점<br />번호</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>채취<br />시간<br />(분)</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>진공압<br />(mmHg)</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>정압<br />(mmH₂O)</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>동압<br />(mmH₂O)</TableLabelCell>
              <TableLabelCell colSpan={3}>온 도(°C)</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>K-Factor</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>오리피스<br />압차<br />(mmH₂O)</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>여과지홀더 온도</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>임핀저<br />출구온도</TableLabelCell>
              <TableLabelCell>채취 전</TableLabelCell>
              <VCell>{startVolume == null ? "0.00" : formatNumber(startVolume * 1000, {minDecimals:2})}</VCell>
            </tr>
            <tr>
              <TableLabelCell>Ts</TableLabelCell>
              <TableLabelCell>Tm(in)</TableLabelCell>
              <TableLabelCell>Tm(out)</TableLabelCell>
              <TableLabelCell>채취 후</TableLabelCell>
              <TableLabelCell>채취량(L)</TableLabelCell>
            </tr>

            {/* 측정점 데이터 행 (최소 5행 표시) */}
            {Array.from({ length: Math.max(5, points.length) }, (_, i) => {
              const mp = points[i];
              const pc = preview?.points[i] ?? null;
              const before = toNumberOrNull(mp?.beforeVm ?? "");
              const after = toNumberOrNull(mp?.afterVm ?? "");
              return (
                <tr key={i}>
                  <TableLabelCell colSpan={2}>{i + 1}번</TableLabelCell>
                  <VCell colSpan={2}>{mp?.samplingTime ?? ""}</VCell>
                  <VCell colSpan={2}>{mp?.vacuumGaugePressure ?? ""}</VCell>
                  <VCell colSpan={2}>{formatNumber(mp?.Ps, {minDecimals:1})}</VCell>
                  <VCell colSpan={2}>{formatNumber(mp?.Pv, {minDecimals:1})}</VCell>
                  <VCell>{mp?.Ts ?? ""}</VCell>
                  <VCell>{mp?.inTm ?? ""}</VCell>
                  <VCell>{mp?.outTm ?? ""}</VCell>
                  <VCell colSpan={2}>{formatNumber(pc?.kFactor, {minDecimals:2})}</VCell>
                  <VCell colSpan={2}>{formatNumber(pc?.orificeDp, {minDecimals:2})}</VCell>
                  <VCell colSpan={2}>{isParticle ? mp?.Ts ?? "" : ""}</VCell>
                  <VCell colSpan={2}>{mp?.finalImpingerTemperature ?? ""}</VCell>
                  <VCell>{after == null ? "" : formatNumber(after * 1000, {minDecimals:2})}</VCell>
                  <VCell>{before != null && after != null ? formatNumber((after - before) * 1000, {minDecimals:2}) : ""}</VCell>
                </tr>
              );
            })}

            {/* 합계 행 */}
            <tr>
              <TableLabelCell colSpan={2}>합 계</TableLabelCell>
              <VCell colSpan={2}>{particleCalc?.totalSamplingTime ?? ""}</VCell>
              <td colSpan={18} className="border border-border bg-muted/40" />
              <VCell>{totalVm == null ? "" : formatNumber(totalVm * 1000, {minDecimals:2})}</VCell>
            </tr>

            {/* 평균 행 */}
            <tr>
              <TableLabelCell colSpan={2}>평 균</TableLabelCell>
              <td colSpan={2} className="border border-border bg-muted/40" />
              <VCell colSpan={2}>{fmt(avgVacuum, 1)}</VCell>
              <VCell colSpan={2}>{fmt(quantity?.avgPs, 1)}</VCell>
              <VCell colSpan={2}>{fmt(quantity?.avgPv, 1)}</VCell>
              <VCell colSpan={1}>{fmt(avgTs, 1)}</VCell>
              <VCell colSpan={2}>{fmt(avgTmC, 1)}</VCell>
              <VCell colSpan={2}>{fmt(particleCalc?.avgKFactor, 2)}</VCell>
              <VCell colSpan={2}>{fmt(particleCalc?.avgOrificeDp, 2)}</VCell>
              <VCell colSpan={2}>{isParticle ? fmt(avgTs, 1) : ""}</VCell>
              <VCell colSpan={2}>{fmt(avgFinalImpinger, 1)}</VCell>
              <td colSpan={2} className="border border-border bg-muted/40" />
            </tr>

            {/* ════════ [수분] ════════ */}
            <tr>
              <TableLabelCell colSpan={4}>[ 수 분 ]</TableLabelCell>
              <TableLabelCell colSpan={2}>수분량(%)</TableLabelCell>
              <VCell colSpan={3}>{formatNumber(preview?.moisture.xw, {minDecimals:2})}</VCell>
              <TableLabelCell colSpan={4}>배출가스온도(°C)</TableLabelCell>
              <VCell colSpan={4}>{fmt(avgTs, 1)}</VCell>
              <TableLabelCell colSpan={4}>포화수증기압</TableLabelCell>
              <VCell colSpan={2}></VCell>
            </tr>
            <tr>
              <TableLabelCell rowSpan={2} colSpan={3}>흡인유량<br />(L/min)</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={3}>가스미터압<br />(mmHg)</TableLabelCell>
              <TableLabelCell colSpan={4}>온 도(°C)</TableLabelCell>
              <TableLabelCell colSpan={4}>무수염화칼슘(g)</TableLabelCell>
              <TableLabelCell colSpan={5}>채 취 시 간</TableLabelCell>
              <VCell colSpan={3}>{fmt(moistureSamplingTime, 0)}</VCell>
              <TableLabelCell>분</TableLabelCell>
            </tr>
            <tr>
              <TableLabelCell colSpan={2}>Tm(in)</TableLabelCell>
              <TableLabelCell colSpan={2}>Tm(out)</TableLabelCell>
              <TableLabelCell colSpan={2}>전 무게</TableLabelCell>
              <TableLabelCell colSpan={2}>후 무게</TableLabelCell>
              <TableLabelCell colSpan={3}>채취 전</TableLabelCell>
              <TableLabelCell colSpan={3}>채취 후</TableLabelCell>
              <TableLabelCell colSpan={3}>채취량(L)</TableLabelCell>
            </tr>
            <tr>
              <VCell colSpan={3}>{formatNumber(sheet.moisture.suctionVelocity, { minDecimals: 1 }) || "-"}</VCell>
              <VCell colSpan={3}>{formatNumber(preview?.moisture.pm_g, {minDecimals:2})}</VCell>
              <VCell colSpan={2}>{formatNumber(sheet.moisture.gasMeterTempIn, {minDecimals:0})}</VCell>
              <VCell colSpan={2}>{formatNumber(sheet.moisture.gasMeterTempOut, {minDecimals:0})}</VCell>
              <VCell colSpan={2}>{formatNumber(sheet.moisture.weightBefore, {minDecimals:2})}</VCell>
              <VCell colSpan={2}>{formatNumber(sheet.moisture.weightAfter, {minDecimals:2})}</VCell>
              <VCell colSpan={3}>{formatNumber(sheet.moisture.dryGasVolumeBefore, { minDecimals: 1 }) || "-"}</VCell>
              <VCell colSpan={3}>{formatNumber(sheet.moisture.dryGasVolumeAfter, { minDecimals: 1 }) || "-"}</VCell>
              <VCell colSpan={3}>{fmt(moistureVolume, 0)}</VCell>
            </tr>

            {/* ════════ [가스상 및 VOCs 물질] ════════ */}
            <tr>
              <TableLabelCell colSpan={5}>[ 가스상 및 VOCs 물질 ]</TableLabelCell>
              {/* 측정시간(15분·30분)은 규정 고정값이라 종료시각을 입력받지 않고 계산한다 */}
              <VCell colSpan={12}>
                가스분석기 측정시간 ( {timeRange(
                  sheet.exhaustGas.gasAnalyzerStartTime,
                  getGasAnalyzerEndTime(sheet.exhaustGas.gasAnalyzerStartTime),
                )} )
              </VCell>
              <VCell colSpan={6}>
                THC 측정시간 ( {timeRange(
                  sheet.exhaustGas.thcAnalyzerStartTime,
                  getThcAnalyzerEndTime(sheet.exhaustGas.thcAnalyzerStartTime),
                )} )
              </VCell>
            </tr>
            <tr>
              <TableLabelCell rowSpan={2} colSpan={3}>항 목</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={4}>측정시간</TableLabelCell>
              <TableLabelCell rowSpan={2}>흡인유량<br />(L/min)</TableLabelCell>
              <TableLabelCell rowSpan={2}>가스미터압<br />(mmHg)</TableLabelCell>
              <TableLabelCell colSpan={2}>온 도(°C)</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>채취전</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>채취후</TableLabelCell>
              <TableLabelCell colSpan={4}>Tube No.</TableLabelCell>
              <TableLabelCell rowSpan={2} colSpan={2}>채취량(L)</TableLabelCell>
              <TableLabelCell colSpan={2}>매 연</TableLabelCell>
            </tr>
            <tr>
              <TableLabelCell>Tm(in)</TableLabelCell>
              <TableLabelCell>Tm(out)</TableLabelCell>
              <TableLabelCell colSpan={2}>현장바탕시료</TableLabelCell>
              <TableLabelCell colSpan={2}>시료</TableLabelCell>
              <VCell colSpan={2}>( &nbsp;&nbsp; : &nbsp;&nbsp; ~ &nbsp;&nbsp; : &nbsp;&nbsp; )</VCell>
            </tr>

            {gasRows.map(({ sample }, i) => (
              <tr key={i}>
                <VCell colSpan={3}>{sample?.sampleName ?? "-"}</VCell>
                <VCell colSpan={4}>{sample ? timeRange(sample.startTime, sample.endTime) : ""}</VCell>
                <VCell>{formatNumber(sample?.suctionQuantity, {minDecimals:1})}</VCell>
                <VCell>{formatNumber(sample?.gasMeterGaugePressure, {minDecimals:2})}</VCell>
                <VCell>{sample?.inTemperature ?? ""}</VCell>
                <VCell>{sample?.outTemperature ?? ""}</VCell>
                <VCell colSpan={2}>{sample?.beforeVolume ?? ""}</VCell>
                <VCell colSpan={2}>{sample?.afterVolume ?? ""}</VCell>
                <VCell colSpan={2}>{sample?.blankSampleNumber ?? ""}</VCell>
                <VCell colSpan={2}>{sample?.sampleNumber ?? ""}</VCell>
                <VCell colSpan={2}>{sample?.samplingVolume ?? ""}</VCell>
                {i === GAS_ROW_COUNT - 4 && <VCell rowSpan={4} colSpan={2}></VCell>}
                {i < GAS_ROW_COUNT - 4 && <><VCell></VCell><VCell></VCell></>}
              </tr>
            ))}

          </tbody>
      </table>
    </div>
  );
};
