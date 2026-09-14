import type { BadgeTone } from "@shared/ui/badges";

import type { SheetSectionId } from "../sections";
import type { SheetForm } from "../types";
import type { AssignedPollutants } from "./measured-pollutants";
import { getRequiredFields, isFilled, readField } from "./required-fields";

// 섹션별 입력 진행도. 섹션의 정의(id·순서·라벨)는 `../sections` 에 있고 여기는 판정만 한다.

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
    done: required.filter((path) => isFilled(readField(sheet, path))).length,
    total: required.length,
  };
};
