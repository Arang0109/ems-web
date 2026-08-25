import type { BadgeTone } from "@shared/ui/badges";

import type { AssignedPollutants } from "./measured-pollutants";
import { getRequiredFields, readField } from "./required-fields";
import type { SheetForm } from "./types";

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

/**
 * 섹션별 진행도(입력 완료 수 / 필수 항목 수).
 *
 * 분모는 {@link getRequiredFields} 에서 **파생**시킨다. 여기서 따로 세면 별표·배지·검증이
 * 각자 다른 목록을 보게 되어, 제출은 되는데 배지는 미완성인 화면이 만들어진다.
 */
export const getSectionProgress = (
  sheet: SheetForm,
  id: SheetSectionId,
  assigned: AssignedPollutants,
): SectionProgress => {
  const required = getRequiredFields(sheet, id, assigned);

  return {
    done: required.filter((path) => readField(sheet, path).trim() !== "").length,
    total: required.length,
  };
};
