import type { SheetForm } from "./types";
import { isParticleCategory } from "./types";

// 측정 데이터 입력 화면의 섹션 메타 — 섹션 바로가기·이전/다음 이동·진행도 배지가 공유한다.
// 순서가 곧 이동 순서다.

export type SheetSectionId = "weather" | "moisture" | "exhaust" | "point" | "sample";

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
  { id: "sample", label: "여지·시료", particleOnly: true },
];

export const getVisibleSections = (isParticle: boolean): SheetSection[] =>
  SHEET_SECTIONS.filter((section) => isParticle || !section.particleOnly);

export interface SectionProgress {
  done: number;
  total: number;
}

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
 */
export const getSectionProgress = (sheet: SheetForm, id: SheetSectionId): SectionProgress => {
  const particle = isParticleCategory(sheet.category);

  switch (id) {
    case "weather": {
      const { pressure, temperature, humidity, weatherCondition, windSpeed } = sheet.weather;
      return progressOf([pressure, temperature, humidity, weatherCondition, windSpeed]);
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
        g.gasAnalyzerStartTime, g.thcAnalyzerStartTime,
        ...g.o2, ...g.co2, ...g.co, ...g.nox, ...g.sox,
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

    case "sample": {
      const sampleValues = sheet.samples.flatMap((s) => [
        s.sampleName, s.sampleNumber, s.startTime, s.endTime,
        s.suctionQuantity, s.gasMeterGaugePressure,
        s.inTemperature, s.outTemperature,
        s.beforeVolume, s.afterVolume, s.samplingVolume,
      ]);
      return progressOf([
        sheet.particle.thimbleFilter, sheet.particle.bgThimbleFilter,
        ...sampleValues,
      ]);
    }
  }
};
