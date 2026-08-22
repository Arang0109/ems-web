import type { StackPollutantListItem } from "@entities/stack-pollutant";
import type { MeasurementCycle } from "@shared/model";

/**
 * 측정시설 원장의 측정항목 수정 폼.
 *
 * 어떤 물질인지(`pollutantId`)는 폼에 없다 — 물질이 바뀌면 다른 항목이므로
 * 삭제 후 재등록이며, 서버도 측정 조건만 받는다.
 */
export type StackPollutantUpdateForm = {
  cycle: MeasurementCycle;
  /** 텍스트 입력의 표현이므로 string. mapper 가 number | null 로 바꾼다 */
  allowance: string;
  /** 측정시설에 기준산소농도가 없으면 체크박스를 보여주지 않고 false 로 남긴다 */
  oxygenApplicable: boolean;
};

export const getDefaultStackPollutantUpdateForm = (
  item?: StackPollutantListItem | null,
): StackPollutantUpdateForm => ({
  cycle: item?.pollutant.cycle ?? 'MONTHLY',
  // 목록 응답의 허용기준은 이미 문자열이라 그대로 초기값이 된다(null 이면 빈 칸).
  allowance: item?.pollutant.allowance ?? '',
  oxygenApplicable: item?.pollutant.oxygenApplicable ?? false,
});
