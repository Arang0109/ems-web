import type { SamplingSheet, SheetRef } from "@entities/schedule";
import type { MeasurementCategory } from "@shared/model";

import type { BlockSnapshot, SheetBlock } from "./blocks";
import {
  SHEET_BLOCKS, getConflictingBlocks, getDirtyBlocks, getUpdatedBlocks, mergeServerSheet,
  toBlockSnapshot, toUpdatedSections,
} from "./blocks";
import type { SheetBaseline } from "./conflict";
import type { GasSampleGroup } from "./gaseous-rows";
import { hydrateSheets } from "./gaseous-rows";
import { fromSheet } from "./mapper";
import type { SheetSectionId } from "./section-progress";
import type { SheetForm } from "./types";

/**
 * 다른 사용자의 저장을 내 폼에 받아들이는 병합. 실시간 알림(SSE)을 받고 상세를 재조회한 뒤 호출한다.
 *
 * 사수와 부사수가 한 기록지의 서로 다른 섹션을 나눠 입력하는 것이 실제 업무 방식인데, 계산 입력이
 * 섹션을 가로질러 엮여 있어(배출가스 O₂ → 산소보정계수, 수분량 → Xw → 유속 → 유량) 상대 입력이
 * 즉시 들어오지 않으면 **저장을 누르기도 전에 두 사람 화면의 계산값이 어긋난다.**
 *
 * 원칙은 하나다 — **내가 편집 중인 블록만 지키고 나머지는 서버 값을 따른다.** 시트 version 도
 * 서버 값을 이어받으므로, 이어서 내가 저장할 때 낙관적 락에 걸리지 않는다. 충돌을 사후에 수습하는
 * 대신 애초에 일어나지 않게 하는 것이 이 경로의 목적이다.
 */

/** 카테고리별로, 방금 다른 사용자가 갱신한 섹션. */
export type UpdatedSections = Partial<Record<MeasurementCategory, SheetSectionId[]>>;

export type RemoteSyncResult = {
  sheets: SheetForm[];
  baseline: SheetBaseline;
  /** 화면에서 강조할 섹션 */
  updatedSections: UpdatedSections;
  /** 사용자에게 알릴 기록지 — 갱신·추가·삭제를 합친 목록 */
  touchedCategories: MeasurementCategory[];
  /**
   * 나와 상대가 **같은 블록**을 고친 기록지. 자동 병합으로 풀 수 없는 유일한 경우다 —
   * 저장하면 409 가 나고 기존 충돌 안내가 어느 값을 남길지 묻는다.
   */
  conflictingCategories: MeasurementCategory[];
  /**
   * 폼 상태를 교체해야 하는지. {@link touchedCategories} 와 따로 두는 이유는
   * **눈에 보이는 변화 없이 version 만 올라가는 경우**가 있기 때문이다. 그 version 을 이어받지 않으면
   * 사용자에게는 아무 일도 없었는데 다음 저장이 낙관적 락에 걸린다.
   */
  changed: boolean;
};

/**
 * 기준선을 블록 단위로 갱신한다. 서버에서 받아온 블록만 옮기고 내가 편집 중인 블록(`keep`)은 그대로 둔다 —
 * 함께 옮기면 그 입력이 다음 저장에서 "바꾼 적 없는 것"으로 잡혀 서버에 올라가지 않는다.
 */
const mergeBaselineBlocks = (
  prev: BlockSnapshot, next: BlockSnapshot, keep: SheetBlock[],
): BlockSnapshot => {
  const kept = new Set(keep);
  return Object.fromEntries(
    SHEET_BLOCKS.map((block) => [block, kept.has(block) ? prev[block] : next[block]]),
  ) as BlockSnapshot;
};

/**
 * @param mine     내 폼 시트
 * @param baseline 마지막으로 서버와 맞춘 블록 기준선
 * @param deleted  내가 삭제하려고 표시해 둔 시트
 * @param server   서버 최신 시트
 * @param groups   측정항목에서 파생한 가스상 시료 행 — 빈 표를 채우는 데 쓴다
 */
export const applyRemoteSheets = (
  mine: SheetForm[], baseline: SheetBaseline, deleted: SheetRef[], server: SamplingSheet[],
  groups: GasSampleGroup[],
): RemoteSyncResult => {
  // 서버 시트도 내 폼과 **같은 규칙으로** 가스상 행을 채운 뒤에 비교한다. 한쪽만 채우면 값이
  // 같은데도 블록이 달라 보여 "동료가 갱신했다"는 헛된 알림이 뜬다. 규칙이 결정적이라
  // 양쪽이 같은 행을 만들고, 그래서 자동 행은 병합에 아무 영향을 주지 않는다.
  const hydratedServer = hydrateSheets(server.map(fromSheet), groups);
  const serverByCategory = new Map(hydratedServer.map((sheet) => [sheet.category, sheet] as const));
  const nextBaseline: SheetBaseline = { ...baseline };
  const updatedSections: UpdatedSections = {};
  const touched: MeasurementCategory[] = [];
  const conflicting: MeasurementCategory[] = [];
  let changed = false;

  const kept = mine.flatMap((sheet): SheetForm[] => {
    const previous = baseline[sheet.category];

    // 아직 서버와 한 번도 맞춰본 적 없는 시트(내가 방금 추가함)는 건드리지 않는다.
    // 같은 카테고리를 둘이 각자 새로 만든 경우이므로 저장 시점의 409 경로가 판단해야 한다.
    if (!previous) return [sheet];

    const dirtyBlocks = getDirtyBlocks(sheet, previous);
    const latest = serverByCategory.get(sheet.category);

    if (!latest) {
      // 다른 사용자가 지운 기록지. 내가 입력 중이던 값이 있으면 지우지 않고 남겨,
      // 저장 시점에 409 경로가 "다른 사용자가 삭제했다"고 밝히도록 한다.
      if (dirtyBlocks.length > 0) return [sheet];

      delete nextBaseline[sheet.category];
      touched.push(sheet.category);
      changed = true;
      return [];
    }

    const updatedBlocks = getUpdatedBlocks(sheet, latest, dirtyBlocks);
    const conflictingBlocks = getConflictingBlocks(latest, previous, dirtyBlocks);
    const merged = mergeServerSheet(sheet, latest, dirtyBlocks);

    // 같은 블록을 둘이 고쳤다면 version 을 이어받으면 안 된다. 이어받으면 내 저장이 서버를 그냥
    // 통과해 상대 입력을 **말없이 덮어쓴다** — 낙관적 락이 잡아내야 할 바로 그 경우다.
    // 내 version 을 그대로 둬서 409 가 나게 하고, 무엇을 남길지는 기존 충돌 안내가 묻는다.
    const next = conflictingBlocks.length > 0 ? { ...merged, version: sheet.version } : merged;

    nextBaseline[sheet.category] = mergeBaselineBlocks(previous, toBlockSnapshot(next), dirtyBlocks);

    // 값이 그대로여도 version 이 올랐으면 이어받아야 한다 — 안 그러면 다음 저장이 409로 막힌다.
    if (updatedBlocks.length > 0 || next.version !== sheet.version) changed = true;

    if (conflictingBlocks.length > 0) conflicting.push(sheet.category);

    if (updatedBlocks.length > 0) {
      updatedSections[sheet.category] = toUpdatedSections(updatedBlocks);
      touched.push(sheet.category);
    }
    return [next];
  });

  // 다른 사용자가 추가한 기록지도 화면에 나타나야 한다.
  // 단, 내가 지우려고 목록에서 뺀 것은 되살리지 않는다 — 매 동기화마다 삭제가 취소된다.
  const myCategories = new Set(mine.map((sheet) => sheet.category));
  const pendingDeletion = new Set(deleted.map((ref) => ref.category));

  const added = hydratedServer
    .filter((sheet) => !myCategories.has(sheet.category) && !pendingDeletion.has(sheet.category));

  for (const sheet of added) {
    nextBaseline[sheet.category] = toBlockSnapshot(sheet);
    touched.push(sheet.category);
    changed = true;
  }

  return {
    sheets: [...kept, ...added],
    baseline: nextBaseline,
    updatedSections,
    touchedCategories: [...new Set(touched)],
    conflictingCategories: [...new Set(conflicting)],
    changed,
  };
};
