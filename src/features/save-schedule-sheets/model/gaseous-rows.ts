import type { MeasurementItemSnapshot } from "@entities/schedule";
import type { MeasurementCategory } from "@shared/model";

import { particulateSourceOf } from "./sample-rules";
import type { SampleForm, SheetForm } from "./types";
import { getDefaultSampleForm } from "./types";

/**
 * 측정계획의 측정항목에서 현장채취 "가스상 물질" 표의 행을 만든다.
 *
 * 기록지는 개별 물질을 그대로 적지 않는다. 흡착관으로 잡는 16종은 `VOCs-T` 한 병에, 카트리지로
 * 잡는 알데히드류는 `VOCs` 한 병에 담기 때문이다. 반면 흡수액·테드라백은 물질마다 병(백)이 갈리므로
 * 항목별로 한 행씩 적는다. 그래서 **행 수와 항목 수가 같지 않다** — 시료 1건 ↔ 항목 N건이다.
 *
 * 어느 방법이 한 병으로 뭉치고 어느 방법이 항목별인지는 더 이상 여기 박혀 있지 않다 —
 * 고객사가 관리하는 측정방법의 **채취 단위**(`sampleGrouping`)와 통칭명(`mergedSampleName`)이 정하고,
 * 항목은 측정 시점의 사본(`item.method`)으로 그것을 들고 온다. 물질 코드나 `phase` 로 거는 예외도 없다 —
 * 비소화합물처럼 입자상(중금속 여지)이면서 흡수액도 하는 항목은 고객사가 항목별 채취(`PER_ITEM`)
 * 측정방법을 붙이면 같은 규칙으로 행이 생긴다. 반대로 카트리지로 잡지만 입자상 시트에서 채취하는
 * PAH 같은 항목은 고객사가 `NONE` 방법에 붙여야 한다 — 측정물질 폼이 그 어긋남을 경고한다.
 *
 * 그 대응을 잃지 않도록 각 행은 자신이 담은 항목을 {@link SampleForm.pollutantIds} 로 들고 다닌다.
 * 실험분석은 항목별로 값을 적어야 하므로, 통칭 행의 채취시각을 개별 항목으로 되돌릴 때 이 링크가
 * 유일한 근거가 된다.
 */

/**
 * 가스상 표에 적는 시료 한 행.
 *
 * `key` 는 화면에서 같은 행인지 가리는 데만 쓰고 **서버로 보내지 않는다** — 저장되는 것은
 * `pollutantIds` 뿐이며, 그것만으로 어느 항목이 어느 병에 담겼는지 복원된다.
 */
export type GasSampleGroup = {
  key: string;
  sampleName: string;
  pollutantIds: number[];
  /**
   * 등속흡인 항목(먼지·중금속·수은 방식)이면 그 입자상 기록지의 카테고리. 이 그룹은 **그 기록지에만** 놓인다 —
   * 비소화합물 흡수액은 중금속 기록지에만. 정유량 항목은 null 이며 어느 기록지에나 적을 수 있다.
   */
  particulateSource: MeasurementCategory | null;
};

/**
 * 통칭 행을 묶는 키. 원장 연결키(`methodId`)가 기준이지만, 측정방법 승격 이전 문서는 마이그레이션이
 * enum 문자열을 사본으로 바꾼 것이라 `methodId` 가 없다 — 그때는 이름으로 묶는다.
 */
const methodKeyOf = (method: NonNullable<MeasurementItemSnapshot["method"]>): string =>
  method.methodId !== null ? `method:${method.methodId}` : `method-name:${method.name}`;

/**
 * 이 항목을 가스상 표에 적는가 — 측정방법의 채취 단위가 정한다. `NONE`(먼지·중금속·수은·현장측정)은
 * 가스상 시료가 없다.
 *
 * 측정방법이 null 인 항목(카탈로그 도입 이전 스냅샷·고객사 자체 물질·측정방법 미지정)은 자동으로
 * 만들지 않는다. 사용자가 직접 추가하도록 화면에서 안내만 한다.
 */
const isGasSampling = (item: MeasurementItemSnapshot): boolean =>
  item.method !== null && item.method.sampleGrouping !== "NONE" && item.mode !== "DIRECT_READING";

/**
 * 자동으로 만들 수 없어 사용자에게 알려야 하는 항목 — 측정방법이 비어 있다.
 */
export const getUnresolvedItems = (
  items: MeasurementItemSnapshot[],
): MeasurementItemSnapshot[] =>
  items.filter((item) => item.method === null);

/**
 * 측정항목에서 가스상 시료 행 목록을 만든다.
 *
 * 순서는 `items` 배열 순서를 그대로 따르고, 통칭 행은 **그 그룹의 첫 항목 자리**에 놓는다.
 * `items` 순서가 곧 성적서 표기 순서라 임의로 정렬하면 기록지와 성적서가 어긋난다.
 */
export const buildGasSampleGroups = (
  items: MeasurementItemSnapshot[],
): GasSampleGroup[] => {
  const groups: GasSampleGroup[] = [];
  const mergedIndexByKey = new Map<string, number>();

  for (const item of items) {
    if (!isGasSampling(item) || item.method === null) continue;

    const methodKey = methodKeyOf(item.method);

    if (item.method.sampleGrouping !== "MERGED" || item.method.mergedSampleName === null) {
      groups.push({
        key: `${methodKey}:${item.pollutantId}`,
        sampleName: item.nameKr,
        pollutantIds: [item.pollutantId],
        particulateSource: particulateSourceOf(item.mode),
      });
      continue;
    }

    const at = mergedIndexByKey.get(methodKey);

    if (at === undefined) {
      mergedIndexByKey.set(methodKey, groups.length);
      groups.push({
        key: methodKey,
        sampleName: item.method.mergedSampleName,
        pollutantIds: [item.pollutantId],
        particulateSource: particulateSourceOf(item.mode),
      });
    } else {
      groups[at].pollutantIds.push(item.pollutantId);
    }
  }

  return groups;
};

/**
 * 아직 어느 기록지에도 적히지 않은 그룹.
 *
 * 판정이 **기록지 하나가 아니라 전체를 가로지른다**는 것이 이 기능의 핵심이다. 가스상 표는
 * 카테고리와 무관하게 네 기록지 모두에 있고, 업체마다 어디에 몇 행을 적는지가 다르다.
 * 배정 규칙을 코드에 박는 대신 "이미 적혔는가"만 판정하면, 첫 기록지에 몰아 적는 지금 방식도
 * 칸이 넘쳐 다음 기록지로 넘기는 방식도 그대로 성립한다.
 *
 * 항목 하나라도 이미 적혀 있으면 그 그룹은 배정된 것으로 본다 — 사용자가 통칭 행을 쪼개
 * 일부만 다른 병에 담았을 수 있고, 그 판단을 자동 채움이 되돌려서는 안 된다.
 */
export const getUnassignedGroups = (
  groups: GasSampleGroup[],
  sheets: SheetForm[],
): GasSampleGroup[] => {
  const assigned = new Set(
    sheets.flatMap((sheet) => sheet.samples.flatMap((sample) => sample.pollutantIds)),
  );

  return groups.filter((group) => !group.pollutantIds.some((id) => assigned.has(id)));
};

/**
 * 이 그룹을 이 카테고리 기록지에 적어도 되는가. 등속흡인 그룹(비소화합물 흡수액)은 그 방식의 입자상
 * 기록지에만 놓인다 — 채취시각·유량·채취량이 같은 기록지 입자상 집계의 사본이라 다른 기록지에는 출처가
 * 없고, 서버(`requireIsokineticRowsOnSourceSheet`)도 거부한다. 정유량 그룹은 어느 기록지에나 놓인다.
 */
export const isGroupAllowedOn = (group: GasSampleGroup, category: MeasurementCategory): boolean =>
  group.particulateSource === null || group.particulateSource === category;

/** 미배정 그룹 중 이 기록지에 적을 수 있는 것 — "미배정 N건" 안내와 자동 추가는 이 목록을 본다 */
export const getUnassignedGroupsFor = (
  groups: GasSampleGroup[],
  sheets: SheetForm[],
  category: MeasurementCategory,
): GasSampleGroup[] =>
  getUnassignedGroups(groups, sheets).filter((group) => isGroupAllowedOn(group, category));

/** 그룹을 빈 시료 행으로 편다 — 항목명과 링크만 채우고 실측값은 사용자가 적는다 */
export const toSampleForm = (group: GasSampleGroup): SampleForm => ({
  ...getDefaultSampleForm(),
  sampleName: group.sampleName,
  pollutantIds: [...group.pollutantIds],
});

/**
 * 서버에서 받은 기록지에 아직 적히지 않은 그룹을 채워 넣는다.
 *
 * **가스상 표가 비어 있는 기록지에만** 넣는다. 이미 행이 있는 기록지는 사용자가 구성을 정해 둔
 * 것이므로 건드리지 않고, 화면에서 "미배정 N건" 으로 알리기만 한다.
 *
 * 앞 기록지에 넣은 그룹은 배정된 것으로 치고 다음 기록지로 넘어간다. 그래서 첫 기록지를 열면
 * 전체가 채워지고 두 번째 기록지는 비어 있게 된다 — 지금 업체가 쓰는 방식 그대로다.
 * 단, 등속흡인 그룹은 그 방식의 입자상 기록지에만 들어간다({@link isGroupAllowedOn}) — 가스상 기록지가
 * 먼저 와도 비소화합물은 건너뛰고 중금속 기록지에서 채운다.
 *
 * **이 결과는 저장 기준선(baseline)에도 함께 반영해야 한다.** 규칙에서 결정적으로 재생성되는
 * 값이라 편집이 아니라 화면 표현이며, 기준선에서 빠지면 사용자가 아무것도 입력하지 않았는데
 * 미저장 변경으로 잡혀 이탈 경고가 뜨고, 동시편집 병합에서 빈 자동 행이 동료가 방금 저장한
 * 실측값을 이긴다.
 */
export const hydrateSheets = (
  sheets: SheetForm[],
  groups: GasSampleGroup[],
): SheetForm[] => {
  let remaining = getUnassignedGroups(groups, sheets);
  if (remaining.length === 0) return sheets;

  return sheets.map((sheet) => {
    if (sheet.samples.length > 0 || remaining.length === 0) return sheet;

    const filled = remaining.filter((group) => isGroupAllowedOn(group, sheet.category));
    if (filled.length === 0) return sheet;

    remaining = remaining.filter((group) => !filled.includes(group));
    return { ...sheet, samples: filled.map(toSampleForm) };
  });
};
