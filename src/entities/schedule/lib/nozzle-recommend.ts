import type { SheetSave } from "../model/types";
import type { SheetCalcExternals } from "./sheet-calc";
import { runSheetCalc } from "./sheet-calc";

// ─────────────────────────────────────────────────────────────
// 적정 노즐사이즈 산정 — 프론트 전용 측정 전 계획 보조 기능(서버 미계산).
// 배정된 노즐 장비의 노즐경 후보별로 kFactor → 오리피스차압 → 예상 흡입량(Vm)
// → 채취수분량(Vlc) → 예상 채취시간을 추정한다. 상수·공식은 서버 ParticleStep과 동일.
// ─────────────────────────────────────────────────────────────

export type NozzleRecommendation = {
  nozzleSize: number;               // 노즐경 (cm)
  kFactor: number | null;
  orificeDp: number | null;         // 오리피스차압 (mmH₂O)
  Vm: number | null;                // 예상 흡입량 (m³) — 희망 흡입량 Vr의 현장조건 환산
  Vlc: number | null;               // 예상 채취수분량 (ml)
  samplingTime: number | null;      // 예상 채취시간 (min)
};

const K_FACTOR_CONST = 0.0000803989;  // 8.03989 × 10⁻⁵ (공정시험법 개정 시 변경)
const DEFAULT_DELTA_H = 46;

const round = (value: number, scale: number): number => {
  const factor = 10 ** scale;
  return Math.round(value * factor + 1e-9 * Math.sign(value)) / factor;
};

/**
 * 노즐경 후보별 추천 목록을 계산한다.
 * @param vr 채취하고자 하는 흡입량 (m³, 표준상태)
 * 시트 평균값(avgTg·avgTm·Pg 등)이 아직 입력되지 않았으면 해당 항목은 null로 남는다.
 */
export const calcNozzleRecommendations = (
  sheet: SheetSave,
  ext: SheetCalcExternals,
  vr: number | null,
): NozzleRecommendation[] => {
  const ctx = runSheetCalc(sheet, ext);
  const deltaH = ext.deltaH ?? DEFAULT_DELTA_H;

  return ext.nozzleDiameters.map((nozzleSize) => {
    // kFactor = K × Cp² × △H × (nozzle×10)⁴ × (1 − Xw/100)² × (Md·Tm·Pg)/(Mw·Tg·Pa)
    let kFactor: number | null = null;
    if (
      ctx.Cp != null && ctx.xw != null && ctx.Md != null && ctx.Mw != null &&
      ctx.avgTm != null && ctx.avgTg != null && ctx.pa != null && ctx.pg != null &&
      ctx.Mw !== 0 && ctx.avgTg !== 0 && ctx.pa !== 0
    ) {
      const nz4 = (nozzleSize * 10) ** 4;
      const moistureRate = 1 - ctx.xw / 100;
      kFactor = round(
        K_FACTOR_CONST * ctx.Cp * ctx.Cp * deltaH * nz4 * moistureRate * moistureRate *
          ((ctx.Md * ctx.avgTm * ctx.pg) / (ctx.Mw * ctx.avgTg * ctx.pa)),
        2,
      );
    }

    const orificeDp = kFactor != null && ctx.avgPv != null ? round(kFactor * ctx.avgPv, 2) : null;
    const pm = ctx.pa != null && orificeDp != null ? ctx.pa + orificeDp / 13.6 : null;

    // 표준상태 희망 흡입량 Vr → 현장 가스미터 조건의 예상 흡입량 Vm
    const vm =
      vr != null && ctx.avgTm != null && pm != null && pm !== 0
        ? round(vr * (ctx.avgTm / 273) * (760 / pm), 5)
        : null;

    // Vlc = Vm × 10³ × (Xw / (100 − Xw)) × (18/22.4)
    const vlc =
      ctx.xw != null && vm != null && 100 - ctx.xw !== 0
        ? round(vm * 1000 * (ctx.xw / (100 - ctx.xw)) * (18 / 22.4), 2)
        : null;

    // 예상 채취시간 = Tg × (0.00346·Vlc + Vm·(Pm/Tm)) × 1.667×10² / (Pg × Vs × An)
    const an = round((Math.PI * nozzleSize * nozzleSize) / 4, 3);
    let samplingTime: number | null = null;
    if (
      ctx.avgTg != null && vlc != null && vm != null && pm != null && ctx.avgTm != null &&
      ctx.pg != null && ctx.Vs != null && an !== 0 && ctx.pg !== 0 && ctx.Vs !== 0 && ctx.avgTm !== 0
    ) {
      const a = ctx.avgTg * (0.00346 * vlc + vm * (pm / ctx.avgTm)) * 166.7;
      const b = ctx.pg * ctx.Vs * an;
      samplingTime = round(a / b, 1);
    }

    return { nozzleSize, kFactor, orificeDp, Vm: vm, Vlc: vlc, samplingTime };
  });
};
