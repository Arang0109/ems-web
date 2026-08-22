import type { NozzleSpecDto, ParticleSamplerSpecDto, PitotTubeSpecDto } from "../../api/dto";
import type { ScheduleSnapshot } from "../../model/types";
import type { SheetCalcExternals } from "./types";

// ── 스냅샷에서 계산 외부입력 추출 ────────────────────────────────
// 표준산소농도·굴뚝 형상/치수는 측정시설(stack) 원장, 피토관 계수·△H@·노즐경은
// 팀 장비 스냅샷의 spec에 있다. spec은 판별 필드가 없으므로 장비 type으로 판별한다.

export const getSheetCalcExternals = (snapshot: ScheduleSnapshot): SheetCalcExternals => {
  const stack = snapshot.client?.workplace?.stack;
  const equipments = snapshot.equipments ?? [];

  const pitotSpec = equipments.find((e) => e.type === "PITOT_TUBE")?.spec as PitotTubeSpecDto | null | undefined;
  const samplerSpec = equipments.find((e) => e.type === "PARTICLE_SAMPLER")?.spec as ParticleSamplerSpecDto | null | undefined;
  const nozzleSpec = equipments.find((e) => e.type === "NOZZLE")?.spec as NozzleSpecDto | null | undefined;

  return {
    standardOxygen: stack?.standardOxygen ?? null,
    shape: stack?.shape ?? null,
    horizontalLength: stack?.horizontalLength ?? null,
    verticalLength: stack?.verticalLength ?? null,
    pitotCoefficients: pitotSpec?.coefficients ?? [],
    deltaH: samplerSpec?.orificeDp ?? null,
    nozzleDiameters: nozzleSpec?.diameters?.map((d) => d.diameter) ?? [],
  };
};
