import type { EquipmentSnapshot, EquipmentSpec } from "@entities/schedule";
import {
  MEASUREMENT_FIELD_LABEL, GRADE_LABEL, SHAPE_LABEL, ORIENTATION_LABEL,
  PITOT_TUBE_TYPE_LABEL,
} from "@shared/config";
import type { EquipType, Shape } from "@shared/model";

export const value = (v?: string | number | null): string => {
  if (v === null || v === undefined) return "-";
  const s = String(v).trim();
  return s === "" ? "-" : s;
};

export const fieldLabel = (v?: string | null): string =>
  v ? (MEASUREMENT_FIELD_LABEL[v as keyof typeof MEASUREMENT_FIELD_LABEL] ?? v) : "-";
export const gradeLabel = (v?: string | null): string =>
  v ? (GRADE_LABEL[v as keyof typeof GRADE_LABEL] ?? v) : "-";
export const shapeLabel = (v?: string | null): string =>
  v ? (SHAPE_LABEL[v as keyof typeof SHAPE_LABEL] ?? v) : "-";
export const orientationLabel = (v?: string | null): string =>
  v ? (ORIENTATION_LABEL[v as keyof typeof ORIENTATION_LABEL] ?? v) : "-";

// 측정시설 치수(원형=지름, 사각형=가로×세로) 표시
export const describeDimension = (
  shape: Shape, horizontal: number | null, vertical: number | null,
): string => {
  if (shape === "CIRCULAR") return `${value(horizontal)} m`;
  if (shape === "RECTANGULAR") return `${value(horizontal)} m × ${value(vertical)} m`;
  return "-";
};

// 장비 사양(spec)을 type에 따라 사람이 읽을 수 있는 항목으로 변환한다.
// spec에는 판별 필드가 없으므로 EquipmentSnapshot.type으로 형태를 판별한다.
export const describeEquipmentSpec = (equip: EquipmentSnapshot): { label: string; value: string }[] => {
  const spec = equip.spec;
  if (!spec) return [];

  switch (equip.type as EquipType) {
    case "PARTICLE_SAMPLER": {
      const s = spec as Extract<EquipmentSpec, { orificeDp: number }>;
      return [
        { label: "적산량", value: value(s.totalVolume) },
        { label: "오리피스 보정계수 △H@", value: value(s.orificeDp) },
        { label: "Yd", value: value(s.yd) },
      ];
    }
    case "GAS_SAMPLER":
    case "OTHER": {
      const s = spec as Extract<EquipmentSpec, { totalVolume: number }>;
      return [{ label: "적산량", value: value(s.totalVolume) }];
    }
    case "PITOT_TUBE": {
      const s = spec as Extract<EquipmentSpec, { pitotTubeType: unknown }>;
      const coeffs = s.coefficients?.map((c) => c.coefficient).join(", ") ?? "";
      return [
        { label: "종류", value: PITOT_TUBE_TYPE_LABEL[s.pitotTubeType] ?? String(s.pitotTubeType) },
        { label: "피토관 계수", value: value(coeffs) },
      ];
    }
    case "NOZZLE": {
      const s = spec as Extract<EquipmentSpec, { diameters: unknown }>;
      const diameters = s.diameters?.map((d) => d.diameter).join(", ") ?? "";
      return [{ label: "노즐 직경 (cm)", value: value(diameters) }];
    }
    default:
      return [];
  }
};
