import type { MeasurementSheet, SheetRef } from "@entities/schedule";
import { MEASUREMENT_CATEGORY_LABEL } from "@shared/config";
import type { MeasurementCategory } from "@shared/model";

import type { BlockSnapshot } from "./blocks";
import { getDirtyBlocks, toBlockSnapshot } from "./blocks";
import type { SheetForm } from "./types";
import { fromSheet } from "./mapper";

/**
 * 내 폼 시트와 서버 최신 시트를 대조한 결과.
 * 저장이 409로 거부됐을 때 "무엇이 어긋났는지"를 사용자에게 밝히고, 되돌릴 범위를 정하는 데 쓴다.
 */
export type SheetDiff = {
  /** 내가 입력한 시트를 다른 사용자가 먼저 저장한 경우 — 되돌리면 내 입력을 잃는다 */
  conflicted: MeasurementCategory[];
  /** 내가 손대지 않은 사이 다른 사용자가 저장한 시트 — 되돌려도 잃을 것이 없다 */
  updatedByOthers: MeasurementCategory[];
  /** 내가 화면을 연 뒤 다른 사용자가 추가한 시트 */
  addedByOthers: MeasurementCategory[];
  /** 내가 화면을 연 뒤 다른 사용자가 삭제한 시트 */
  removedByOthers: MeasurementCategory[];
};

/**
 * 마지막으로 서버에 반영된 시트 상태를 카테고리별로 기록한 기준선.
 * 시트 폼은 mapper(fromSheet)·getDefaultSheetForm 이 만드는 고정 형태라 직렬화 비교로 충분하다.
 *
 * 시트를 통째로 직렬화하지 않고 **블록별로** 쪼개 담는다. 실시간 동기화가 상대 저장을 받아들일 때
 * "내가 편집 중인 블록"과 "서버에서 받아온 블록"을 따로 추적해야 하기 때문이다({@link toBlockSnapshot}).
 */
export type SheetBaseline = Record<string, BlockSnapshot>;

export const toSheetBaseline = (sheets: SheetForm[]): SheetBaseline =>
  Object.fromEntries(sheets.map((sheet) => [sheet.category, toBlockSnapshot(sheet)]));

/**
 * 저장 요청에 실을 시트 — 내가 실제로 값을 바꾼 것만 고른다.
 * 신규 시트는 기준선에 없으므로 항상 포함된다.
 *
 * **이 선별이 동시 편집의 핵심이다.** 손대지 않은 기록지까지 보내면 서버가 그 version 도 올리고
 * (요청에 담긴 시트만 교체·증가시키므로), 그러면 다음 사람이 저장할 때 건드린 적도 없는 기록지가
 * 전부 "다른 사용자가 수정함"으로 잡혀 시트 단위 충돌 판정이 문서 단위 락으로 퇴화한다.
 *
 * 판정은 블록 단위로 하되 **반환은 시트 단위**다 — 서버 API의 저장 단위가 기록지이기 때문이다.
 */
export const getChangedSheets = (sheets: SheetForm[], baseline: SheetBaseline): SheetForm[] =>
  sheets.filter((sheet) => getDirtyBlocks(sheet, baseline[sheet.category]).length > 0);

/**
 * 요청이 들고 있는 version 이 서버 보관본과 어긋나는지 판정한다.
 * 서버에 없는 카테고리(신규·이미 삭제됨)와 버전 도입 전에 저장된 시트는 판정 대상이 아니다.
 */
const isStale = (latest: MeasurementSheet | undefined, myVersion: number | null): boolean => {
  if (!latest || latest.version === null) return false;
  return latest.version !== myVersion;
};

/**
 * 시트를 카테고리 단위로 대조한다. 시트에는 식별자가 없고 category 가 자연키다.
 * 삭제 예정 시트({@link SheetRef})도 편집이므로 함께 판정한다 — 지우려는 사이에 다른 사용자가
 * 그 시트에 값을 입력했으면 충돌이고, 아직 아무도 건드리지 않았다면 내 삭제는 그대로 유효하다.
 *
 * 신규 시트(version === null)는 서버에 대응 시트가 없어야 정상이므로, 같은 카테고리가 서버에
 * 이미 있으면 충돌로 본다 — 두 사람이 같은 시트를 각자 새로 만든 경우다.
 *
 * `edited` 는 내가 실제로 값을 바꾼 카테고리다. 이걸 받아야 "내 입력을 잃는 충돌"과
 * "손대지 않은 사이 남이 저장한 것"을 가려낼 수 있다 — 둘 다 되돌림 대상이지만 사용자가
 * 잃는 것이 다르므로 안내 문구가 달라야 한다.
 */
export const diffSheetVersions = (
  mine: SheetForm[], server: MeasurementSheet[],
  deleted: SheetRef[] = [], edited: MeasurementCategory[] = [],
): SheetDiff => {
  const serverByCategory = new Map(server.map((sheet) => [sheet.category, sheet]));
  const myCategories = new Set(mine.map((sheet) => sheet.category));
  const deletedCategories = new Set(deleted.map((ref) => ref.category));
  // 삭제도 편집이다 — 지우려던 시트를 남이 먼저 고쳤다면 내 의도가 막힌 것이므로 충돌로 다룬다.
  const editedCategories = new Set<MeasurementCategory>([...edited, ...deletedCategories]);

  const stale = [
    ...mine.filter((sheet) => isStale(serverByCategory.get(sheet.category), sheet.version)),
    ...deleted.filter((ref) => isStale(serverByCategory.get(ref.category), ref.version)),
  ].map((sheet) => sheet.category);

  const staleCategories = [...new Set(stale)];

  return {
    conflicted: staleCategories.filter((category) => editedCategories.has(category)),
    updatedByOthers: staleCategories.filter((category) => !editedCategories.has(category)),
    // 내가 지우려고 목록에서 뺀 시트를 "남이 추가한 것"으로 오인하면 삭제가 매번 되돌려진다.
    addedByOthers: server
      .filter((sheet) => !myCategories.has(sheet.category) && !deletedCategories.has(sheet.category))
      .map((sheet) => sheet.category),
    removedByOthers: mine
      .filter((sheet) => sheet.version !== null && !serverByCategory.has(sheet.category))
      .map((sheet) => sheet.category),
  };
};

/**
 * 지정한 카테고리의 시트만 서버 최신 내용으로 교체하고, 나머지 시트의 내 입력은 그대로 둔다.
 * 서버에서 사라진 시트는 목록에서 빼고, 서버에만 있는 시트는 뒤에 붙인다 —
 * 충돌을 푼 뒤 곧바로 다시 저장할 수 있는 상태로 만드는 것이 목적이다.
 */
export const resolveWithServer = (
  mine: SheetForm[], server: MeasurementSheet[], categories: MeasurementCategory[],
): SheetForm[] => {
  const target = new Set(categories);
  const serverByCategory = new Map(server.map((sheet) => [sheet.category, sheet]));
  const myCategories = new Set(mine.map((sheet) => sheet.category));

  const resolved = mine
    .filter((sheet) => !target.has(sheet.category) || serverByCategory.has(sheet.category))
    .map((sheet) => {
      const latest = serverByCategory.get(sheet.category);
      return target.has(sheet.category) && latest ? fromSheet(latest) : sheet;
    });

  const added = server
    .filter((sheet) => target.has(sheet.category) && !myCategories.has(sheet.category))
    .map(fromSheet);

  return [...resolved, ...added];
};

/** 되돌려야 할 시트 목록. 수정·추가·삭제를 한 번에 최신 상태로 맞춘다. */
export const getResolvableCategories = (diff: SheetDiff): MeasurementCategory[] =>
  [...new Set([
    ...diff.conflicted, ...diff.updatedByOthers, ...diff.addedByOthers, ...diff.removedByOthers,
  ])];

/** 대조 결과가 모두 비어 있으면 되돌릴 것이 없다(물리적 동시 저장 등 — 다시 저장하면 된다). */
export const hasSheetDivergence = (diff: SheetDiff): boolean =>
  getResolvableCategories(diff).length > 0;

/**
 * 충돌 안내 문구. 어느 기록지가 어떻게 어긋났는지 밝히고, 되돌렸을 때 무엇을 잃는지 먼저 알린다.
 * 사용자가 "되돌리기"를 누르기 전에 판단할 수 있어야 하므로 목록을 생략하지 않는다.
 */
export const describeSheetDiff = (diff: SheetDiff): string => {
  const line = (category: MeasurementCategory, what: string) =>
    `• ${MEASUREMENT_CATEGORY_LABEL[category]} — ${what}`;

  const lines = [
    // 내가 입력한 기록지가 먼저다 — 되돌리면 실제로 잃는 것이 있는 항목이라 눈에 먼저 들어와야 한다.
    ...diff.conflicted.map((c) => line(c, "내가 입력하는 사이 다른 사용자가 저장했습니다")),
    ...diff.updatedByOthers.map((c) => line(c, "다른 사용자가 수정했습니다")),
    ...diff.addedByOthers.map((c) => line(c, "다른 사용자가 추가했습니다")),
    ...diff.removedByOthers.map((c) => line(c, "다른 사용자가 삭제했습니다")),
  ];

  const losing = diff.conflicted.length > 0
    ? `최신 내용으로 되돌리면 ${diff.conflicted.map((c) => MEASUREMENT_CATEGORY_LABEL[c]).join("·")} `
      + "기록지에 입력한 값은 사라집니다.\n나머지 기록지의 입력은 그대로 남아 이어서 저장할 수 있습니다."
    : "내가 입력한 기록지는 아니므로 되돌려도 잃는 값은 없습니다.";

  return ["기록지 변경이 감지되었습니다.", "", ...lines, "", losing].join("\n");
};
