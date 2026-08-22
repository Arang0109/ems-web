import type { ParticleSamplerSpec, ScheduleSnapshot, SheetCalcExternals, SheetCalcPreview } from "@entities/schedule";
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

// 종이 기록지(대기시료 채취기록지) 재현 — 표시 전용. 구버전 ReportPreviewContent 이식.

/**
 * 기록지의 고정 폭(px). 23열이 뭉개지지 않는 최소 폭이며, 이 값보다 좁혀서 그리지 않는다.
 * 화면이 좁을 때 줄이는 것은 뷰어(`DocumentViewerDialog`)의 배율이 맡는다 —
 * 표를 접거나 늘리면 종이 기록지와 대조할 수가 없다.
 */
export const REPORT_DOCUMENT_WIDTH = 800;

interface Props {
  sheet: SheetForm;
  preview: SheetCalcPreview | null;
  snapshot: ScheduleSnapshot;
  basicInfoForm: ScheduleBasicInfoForm;  // 저장 전 입력값을 반영하려 스냅샷 대신 폼 값을 쓴다
  externals: SheetCalcExternals;
}

// 기록지 값 셀
const VCell = ({
  children, colSpan, rowSpan,
}: { children?: React.ReactNode; colSpan?: number; rowSpan?: number }) => (
  <td colSpan={colSpan} rowSpan={rowSpan}
    className="border border-border p-1 text-center align-middle">
    {children}
  </td>
);

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

export const ReportPreviewContent = ({ sheet, preview, snapshot, basicInfoForm, externals }: Props) => {
  const { basicInfo, client, items } = snapshot;
  const stack = client.workplace.stack;
  const preventionName = stack.preventions?.[0]?.name ?? "방지시설 설치의무 면제";

  const isParticle = sheet.category !== "GAS";
  const points = sheet.samplingPoints;
  const quantity = preview?.quantity ?? null;
  const particleCalc = preview?.particle ?? null;

  const samplerSpec = snapshot.equipments?.find((e) => e.type === "PARTICLE_SAMPLER")?.spec as
    | ParticleSamplerSpec | null | undefined;

  // 연도 직경·벽면거리 (원형: r − r·√((2i−1)/2n), cm)
  const pointCnt = points.length;
  const d = stack.shape === "CIRCULAR" ? stack.horizontalLength : stack.verticalLength;
  const r = d == null ? null : d / 2;
  const wallDistances: string[] = [];
  let stackLength: string;
  if (stack.shape === "CIRCULAR") {
    for (let i = 1; i <= pointCnt; i++) {
      if (r != null && pointCnt > 0) {
        wallDistances.push(((r - r * Math.sqrt((2 * i - 1) / (2 * pointCnt))) * 100).toFixed(1));
      }
    }
    stackLength = stack.horizontalLength != null ? stack.horizontalLength.toFixed(3) : "";
  } else {
    if (r != null) wallDistances.push((r * 100).toFixed(1));
    stackLength = stack.horizontalLength != null && stack.verticalLength != null
      ? `${stack.horizontalLength.toFixed(3)} × ${stack.verticalLength.toFixed(3)}` : "";
  }

  // 평균값 (기록지 평균행)
  const avgTs = quantity?.avgTg == null ? null : quantity.avgTg - 273;
  const avgTmC = preview?.avgTm == null ? null : preview.avgTm - 273;   // 가스미터 온도 (°C)
  const avgVacuum = avgOf(points.map((p) => p.vacuumGaugePressure));
  const avgFinalImpinger = avgOf(points.map((p) => p.finalImpingerTemperature));

  // 가스흡입량 — 마지막 채취 후 지시량을 표준상태로 환산
  const lastAfterVm = [...points].reverse().map((p) => toNumberOrNull(p.afterVm)).find((v) => v != null) ?? null;
  const suctionVolume = (() => {
    if (lastAfterVm == null || avgTmC == null || preview?.weather.pa == null || particleCalc?.avgOrificeDp == null) return null;
    const deltaHmmHg = particleCalc.avgOrificeDp / 13.6;
    return lastAfterVm * (273 / (273 + avgTmC)) * ((preview.weather.pa + deltaHmmHg) / 760);
  })();

  const startVolume = toNumberOrNull(points[0]?.beforeVm ?? "");
  const nozzleSize = toNumberOrNull(sheet.particle.nozzleSize);
  const nozzleArea = nozzleSize == null ? null : (Math.PI * nozzleSize * nozzleSize) / 4;

  // 수분 섹션 파생값 — 채취시간은 흡입량 ÷ 흡인유속이라 입력칸 없이 계산한다
  const moistureVolume = preview?.moisture.vm_g ?? null;
  const moistureSamplingTime = calcMoistureSamplingMinutes(sheet.moisture, preview);

  // 가스상 8행 (시료 + 측정항목 순서 매칭)
  const gasRows = Array.from({ length: GAS_ROW_COUNT }, (_, i) => ({
    sample: sheet.samples[i] ?? null,
    item: items[i] ?? null,
  }));

  const weatherLabel = sheet.weather.weatherCondition
    ? WEATHER_CONDITION_LABEL[sheet.weather.weatherCondition as WeatherCondition] : "-";
  const windLabel = sheet.weather.windDirection
    ? WIND_DIRECTION_LABEL[sheet.weather.windDirection as WindDirection] : "-";

  return (
    /* 폭은 항상 REPORT_DOCUMENT_WIDTH 고정 — 가로 스크롤·축소는 뷰어가 배율로 처리한다 */
    <div className="bg-background p-4" style={{ width: REPORT_DOCUMENT_WIDTH }}>
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
              <VCell colSpan={3}>{basicInfo.referenceNumber ?? "-"}</VCell>
              <VCell colSpan={2}>{MEASUREMENT_CATEGORY_LABEL[sheet.category]}</VCell>
            </tr>

            {/* ── 업체명 / 굴뚝단면 / 기상 (5행 묶음) ────── */}
            <tr>
              <TableLabelCell colSpan={4}>업 체 명</TableLabelCell>
              <VCell colSpan={5}>{client.workplace.name}</VCell>
              <VCell rowSpan={5} colSpan={6}>
                <div className="mb-1">굴뚝높이: {stack.height?.toFixed(1) ?? "-"} m</div>
                <div className="mb-1">굴뚝단면 및 측정점 배열</div>
                <div className="w-24 h-24 border-2 border-border rounded-full mx-auto flex items-center justify-center text-muted-foreground">
                  ○
                </div>
              </VCell>
              <TableLabelCell colSpan={3}>대기온도</TableLabelCell>
              <VCell colSpan={2}>{sheet.weather.temperature || "-"} <i>°C</i></VCell>
              <TableLabelCell colSpan={2}>습 도</TableLabelCell>
              <VCell colSpan={1}>{sheet.weather.humidity || "-"} <i>%</i></VCell>
            </tr>
            <tr>
              <TableLabelCell colSpan={4}>배 출 시 설</TableLabelCell>
              <VCell colSpan={5}>{stack.semsNumber}{stack.name ? `(${stack.name})` : ""}</VCell>
              <TableLabelCell colSpan={3}>풍 향</TableLabelCell>
              <VCell colSpan={2}>{windLabel}</VCell>
              <TableLabelCell colSpan={2}>날 씨</TableLabelCell>
              <VCell colSpan={1}>{weatherLabel}</VCell>
            </tr>
            <tr>
              <TableLabelCell colSpan={4}>방지시설명</TableLabelCell>
              <VCell colSpan={5}>{preventionName}</VCell>
              <TableLabelCell colSpan={3}>풍 속</TableLabelCell>
              <VCell colSpan={2}>{sheet.weather.windSpeed || "-"} <i>m/s</i></VCell>
              <TableLabelCell colSpan={2}>피토관계수</TableLabelCell>
              <VCell colSpan={1}>{quantity?.Cp?.toFixed(3) ?? "-"}</VCell>
            </tr>
            <tr>
              <TableLabelCell colSpan={4}>측 정 일</TableLabelCell>
              <VCell colSpan={5}>{formatDateDot(basicInfo.sampledAt)}</VCell>
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
              <VCell colSpan={4}>{wallDistances[0] ?? ""}</VCell>
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
              <VCell colSpan={4}>{wallDistances[1] ?? ""}</VCell>
              <TableLabelCell colSpan={3}>누출검사 확인 (mmHg)</TableLabelCell>
              <VCell colSpan={2}>{isParticle ? 381 : "-"}</VCell>
              <TableLabelCell colSpan={2}>배출가스 정압 (mmHg)</TableLabelCell>
              <VCell>{quantity?.avgPs == null ? "-" : (Math.round((quantity.avgPs / 13.6) * 100) / 100).toFixed(2)}</VCell>
            </tr>

            <tr>
              <TableLabelCell colSpan={4}>기술책임자 확인</TableLabelCell>
              <VCell colSpan={5}>(서명)</VCell>
              <TableLabelCell colSpan={2}>3지점</TableLabelCell>
              <VCell colSpan={4}>{wallDistances[2] ?? ""}</VCell>
              <TableLabelCell colSpan={5}>흡인노즐 (mm)</TableLabelCell>
              <VCell colSpan={3}>{fmt(toNumber(sheet.particle.nozzleSize) * 10, 2) || "-"}</VCell>
            </tr>

            <tr>
              <TableLabelCell colSpan={4}>시료채취자 확인</TableLabelCell>
              <VCell colSpan={5}>{basicInfoForm.mentorName || "-"} (서명)<br />{basicInfoForm.menteeName || "-"} (서명)</VCell>
              <TableLabelCell colSpan={2}>4지점</TableLabelCell>
              <VCell colSpan={4}>{wallDistances[3] ?? ""}</VCell>
              <TableLabelCell colSpan={5}>노즐단면적 (cm²)</TableLabelCell>
              <VCell colSpan={3}>{fmt(nozzleArea, 3) || "-"}</VCell>
            </tr>

            <tr>
              <TableLabelCell colSpan={4}>환경기술인</TableLabelCell>
              <VCell colSpan={5}>{basicInfoForm.facilityManager || "-"} (서명)</VCell>
              <TableLabelCell colSpan={2}>5지점</TableLabelCell>
              <VCell colSpan={4}>{wallDistances[4] ?? ""}</VCell>
              <TableLabelCell colSpan={5}>등속흡인계수 (%)</TableLabelCell>
              <VCell colSpan={3}>{fmt(particleCalc?.avgIsokineticRatio, 1)}</VCell>
            </tr>

            {/* ════════ [입자상 물질] ════════ */}
            <tr>
              <TableLabelCell colSpan={23}>
                [입자상 물질] &nbsp;&nbsp; 측정시간 (&nbsp;
                {timeRange(sheet.particle.samplingStartTime, sheet.particle.samplingEndTime)}
                &nbsp;)
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
              <VCell>{startVolume == null ? "0.00" : formatNumber((startVolume * 1000).toFixed(2))}</VCell>
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
                  <VCell colSpan={2}>{mp?.Ps ?? ""}</VCell>
                  <VCell colSpan={2}>{mp?.Pv ?? ""}</VCell>
                  <VCell>{mp?.Ts ?? ""}</VCell>
                  <VCell>{mp?.inTm ?? ""}</VCell>
                  <VCell>{mp?.outTm ?? ""}</VCell>
                  <VCell colSpan={2}>{pc?.kFactor ?? ""}</VCell>
                  <VCell colSpan={2}>{pc?.orificeDp ?? ""}</VCell>
                  <VCell colSpan={2}>{isParticle ? mp?.Ts ?? "" : ""}</VCell>
                  <VCell colSpan={2}>{mp?.finalImpingerTemperature ?? ""}</VCell>
                  <VCell>{after == null ? "" : formatNumber((after * 1000).toFixed(2))}</VCell>
                  <VCell>{before != null && after != null ? formatNumber(((after - before) * 1000).toFixed(2)) : ""}</VCell>
                </tr>
              );
            })}

            {/* 합계 행 */}
            <tr>
              <TableLabelCell colSpan={2}>합 계</TableLabelCell>
              <VCell colSpan={2}>{particleCalc?.totalSamplingTime ?? ""}</VCell>
              <td colSpan={18} className="border border-border bg-muted/40" />
              <VCell>{lastAfterVm == null ? "" : formatNumber((lastAfterVm * 1000).toFixed(2))}</VCell>
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
              <VCell colSpan={3}>{preview?.moisture.xw ?? ""}</VCell>
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
              <VCell colSpan={3}>{preview?.moisture.pm_g ?? "-"}</VCell>
              <VCell colSpan={2}>{sheet.moisture.gasMeterTempIn || "-"}</VCell>
              <VCell colSpan={2}>{sheet.moisture.gasMeterTempOut || "-"}</VCell>
              <VCell colSpan={2}>{sheet.moisture.weightBefore || "-"}</VCell>
              <VCell colSpan={2}>{sheet.moisture.weightAfter || "-"}</VCell>
              <VCell colSpan={3}>{formatNumber(sheet.moisture.dryGasVolumeBefore, { minDecimals: 1 }) || "-"}</VCell>
              <VCell colSpan={3}>{formatNumber(sheet.moisture.dryGasVolumeAfter, { minDecimals: 1 }) || "-"}</VCell>
              <VCell colSpan={3}>{fmt(moistureVolume, 1)}</VCell>
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
                <VCell>{sample?.suctionQuantity ?? ""}</VCell>
                <VCell>{sample?.gasMeterGaugePressure ?? ""}</VCell>
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
