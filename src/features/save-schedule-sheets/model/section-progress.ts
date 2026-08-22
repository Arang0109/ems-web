import type { BadgeTone } from "@shared/ui/badges";

import type { ExhaustGasVisibility } from "./measured-pollutants";
import type { SheetForm } from "./types";
import { isParticleCategory } from "./types";

// 측정 데이터 입력 화면의 섹션 메타 — 섹션 바로가기·이전/다음 이동·진행도 배지가 공유한다.
// 순서가 곧 이동 순서다.

export type SheetSectionId = "weather" | "moisture" | "exhaust" | "point" | "sample" | "gaseous";

export interface SheetSection {
  id: SheetSectionId;
  label: string;
  /** 입자상 시트에서만 노출되는 섹션 */
  particleOnly?: boolean;
}

export const SHEET_SECTIONS: SheetSection[] = [
  { id: "weather", label: "기상정보" },
  { id: "moisture", label: "수분량" },
  { id: "exhaust", label: "배출가스" },
  { id: "point", label: "측정점" },
  { id: "sample", label: "여지", particleOnly: true },
  // 가스상 물질은 입자상·가스상을 가리지 않고 모든 기록지가 작성한다.
  { id: "gaseous", label: "가스상 물질" },
];

export const getVisibleSections = (isParticle: boolean): SheetSection[] =>
  SHEET_SECTIONS.filter((section) => isParticle || !section.particleOnly);

export interface SectionProgress {
  done: number;
  total: number;
}

/**
 * 진행도 배지의 톤 — 한눈에 "손대지 않은 섹션 / 채우는 중 / 다 채운 섹션"을 구분한다.
 *
 * 미완성을 danger 로 두지 않는 것은 의도다. 아직 입력하지 않았을 뿐 오류가 아니므로,
 * 주의(warning) 까지만 쓰고 빨강은 실제 검증 실패에 남겨둔다.
 */
export const getProgressTone = ({ done, total }: SectionProgress): BadgeTone => {
  // 필수 항목이 없는 섹션(측정점 0개 등)은 채울 것이 없으니 완료로 본다.
  if (done >= total) return "brand";
  if (done === 0) return "neutral";
  return "warning";
};

const isFilled = (value: string): boolean => value.trim() !== "";

const progressOf = (values: string[]): SectionProgress => ({
  done: values.filter(isFilled).length,
  total: values.length,
});

/**
 * 섹션별 진행도(입력 완료 수 / 필수 항목 수).
 *
 * 분모는 폼 모델의 "필수 입력" 필드만 센다. 자동계산 결과는 입력이 아니므로 제외하고,
 * 풍향처럼 선택 입력인 필드도 제외한다(피그마 기상정보 배지가 5/5 인 이유).
 * 측정점·시료처럼 개수가 가변인 섹션은 분모도 함께 늘어난다.
 *
 * `visiblePollutants` 는 배출가스 섹션에서 실제로 노출 중인 THC·NOx·SOx 입력칸을 알려준다.
 * 화면에 없는 칸을 분모에 남기면 채울 방법이 없는 배지가 되므로 노출된 것만 센다.
 */
export const getSectionProgress = (
  sheet: SheetForm,
  id: SheetSectionId,
  visiblePollutants: ExhaustGasVisibility,
): SectionProgress => {
  const particle = isParticleCategory(sheet.category);

  switch (id) {
    case "weather": {
      const { pressure, temperature, humidity, weatherCondition, windDirection, windSpeed } = sheet.weather;
      return progressOf([pressure, temperature, humidity, weatherCondition, windDirection, windSpeed]);
    }

    case "moisture": {
      const m = sheet.moisture;
      return progressOf([
        m.weightBefore, m.weightAfter,
        m.gasMeterTempIn, m.gasMeterTempOut,
        m.dryGasVolumeBefore, m.dryGasVolumeAfter,
        m.gasMeterGaugePressure, m.suctionVelocity,
      ]);
    }

    case "exhaust": {
      const g = sheet.exhaustGas;
      return progressOf([
        g.gasAnalyzerStartTime,
        ...(visiblePollutants.thc ? [g.thcAnalyzerStartTime] : []),
        ...g.o2, ...g.co2, ...g.co,
        ...(visiblePollutants.nox ? g.nox : []),
        ...(visiblePollutants.sox ? g.sox : []),
      ]);
    }

    case "point": {
      const pointValues = sheet.samplingPoints.flatMap((p) =>
        particle
          ? [p.Ts, p.Pv, p.Ps, p.inTm, p.outTm, p.samplingTime, p.beforeVm, p.afterVm,
             p.vacuumGaugePressure, p.finalImpingerTemperature]
          : [p.Ts, p.Pv, p.Ps],
      );
      const particleValues = particle
        ? [sheet.particle.nozzleSize, sheet.particle.samplingStartTime]
        : [];
      return progressOf([...pointValues, ...particleValues]);
    }

    case "sample":
      return progressOf([sheet.particle.thimbleFilter, sheet.particle.bgThimbleFilter]);

    case "gaseous":
      // 바탕시료는 선택 입력이라 분모에서 뺀다.
      return progressOf(sheet.samples.flatMap((s) => [
        s.sampleName
      ]));
  }
};
