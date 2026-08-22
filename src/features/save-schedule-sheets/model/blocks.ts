import type { SheetSectionId } from "./section-progress";
import type { SheetForm } from "./types";

/**
 * 기록지를 나눠 입력할 수 있는 최소 단위. 사수와 부사수가 한 기록지의 서로 다른 섹션을
 * 동시에 입력하는 것이 실제 업무 방식이므로, 상대 저장을 받아들일 때 **내가 손대고 있는
 * 블록만 지키고 나머지는 서버 값으로 갱신**한다.
 *
 * 이 분해가 성립하는 이유는 {@link SheetForm} 이 **입력값만** 담고 계산 결과를 담지 않기
 * 때문이다(`WeatherForm` 에 Pa 가 없고 `MoistureForm` 에 Xw 가 없다). 계산은 서버가 병합본
 * 전체로 파이프라인을 다시 돌려 산출하므로, 입력을 블록 단위로 갈라도 계산 일관성은 깨지지 않는다.
 *
 * 서버의 충돌 판정 단위는 여전히 기록지(category) 하나다. 블록은 순전히 화면 쪽 개념이며,
 * 실시간 동기화가 상대 저장을 미리 흡수해 주기 때문에 서버까지 갈 충돌 자체가 드물어진다.
 */
export type SheetBlock =
  | "weather" | "moisture" | "exhaustGas" | "samplingPoints" | "samples" | "particle";

export const SHEET_BLOCKS: SheetBlock[] = [
  "weather", "moisture", "exhaustGas", "samplingPoints", "samples", "particle",
];

/**
 * 블록이 화면의 어느 섹션에 걸치는지. 갱신된 블록을 사용자에게 표시할 때 쓴다.
 *
 * `particle` 만 두 섹션에 걸친다 — 노즐경·채취시각은 "측정점", 여지번호는 "여지" 섹션에
 * 나타나지만 폼 모델에서는 한 덩어리다. 그래서 노즐경과 여지번호를 두 사람이 동시에 고치면
 * 여전히 한쪽이 밀린다(알려진 한계).
 */
export const BLOCK_SECTIONS: Record<SheetBlock, SheetSectionId[]> = {
  weather: ["weather"],
  moisture: ["moisture"],
  exhaustGas: ["exhaust"],
  samplingPoints: ["point"],
  samples: ["gaseous"],
  particle: ["point", "sample"],
};

/** 블록별 직렬화 스냅샷. 저장 기준선과 변경 판정에 쓴다. */
export type BlockSnapshot = Record<SheetBlock, string>;

export const toBlockSnapshot = (sheet: SheetForm): BlockSnapshot => ({
  weather: JSON.stringify(sheet.weather),
  moisture: JSON.stringify(sheet.moisture),
  exhaustGas: JSON.stringify(sheet.exhaustGas),
  samplingPoints: JSON.stringify(sheet.samplingPoints),
  samples: JSON.stringify(sheet.samples),
  particle: JSON.stringify(sheet.particle),
});

/**
 * 기준선 대비 내가 바꾼 블록. 기준선이 없는 시트(아직 저장된 적 없는 신규)는 전 블록을 변경으로 본다.
 */
export const getDirtyBlocks = (sheet: SheetForm, baseline?: BlockSnapshot): SheetBlock[] => {
  if (!baseline) return [...SHEET_BLOCKS];

  const current = toBlockSnapshot(sheet);
  return SHEET_BLOCKS.filter((block) => current[block] !== baseline[block]);
};

/** 지정한 블록만 `source` 값으로 바꾼 시트를 반환한다. */
const applyBlock = (target: SheetForm, source: SheetForm, block: SheetBlock): SheetForm => {
  switch (block) {
    case "weather": return { ...target, weather: source.weather };
    case "moisture": return { ...target, moisture: source.moisture };
    case "exhaustGas": return { ...target, exhaustGas: source.exhaustGas };
    case "samplingPoints": return { ...target, samplingPoints: source.samplingPoints };
    case "samples": return { ...target, samples: source.samples };
    case "particle": return { ...target, particle: source.particle };
  }
};

/**
 * 서버 최신 시트를 내 폼에 받아들인다. 내가 편집 중인 블록(`dirtyBlocks`)은 내 값을 지키고
 * 나머지는 서버 값으로 바꾼다.
 *
 * `version` 은 **항상 서버 값을 따른다**. 이것이 이 병합의 핵심이다 — 상대 저장을 받아들이면서
 * version 까지 이어받아야, 이어서 내가 저장할 때 낙관적 락에 걸리지 않는다.
 */
export const mergeServerSheet = (
  mine: SheetForm, server: SheetForm, dirtyBlocks: SheetBlock[],
): SheetForm =>
  dirtyBlocks.reduce((merged, block) => applyBlock(merged, mine, block), server);

/**
 * 내가 편집 중인데 **서버에서도 바뀐** 블록 — 진짜 충돌이다.
 *
 * 판정에 기준선이 필요하다. 내 값과 서버 값을 직접 비교하면 내가 고쳤다는 이유만으로 늘 달라 보여
 * "상대가 건드렸는지"를 구분할 수 없다. 서버 값이 기준선에서 벗어났는지로 봐야 한다.
 */
export const getConflictingBlocks = (
  server: SheetForm, baseline: BlockSnapshot, dirtyBlocks: SheetBlock[],
): SheetBlock[] => {
  const latest = toBlockSnapshot(server);
  return dirtyBlocks.filter((block) => latest[block] !== baseline[block]);
};

/**
 * 서버 값으로 실제로 바뀐 블록. 내가 편집 중이라 지켜낸 블록과, 값이 같아 바뀔 것이 없던 블록은 제외한다.
 * 화면에 "여기가 갱신됐다"를 표시할 대상이다.
 */
export const getUpdatedBlocks = (
  mine: SheetForm, server: SheetForm, dirtyBlocks: SheetBlock[],
): SheetBlock[] => {
  const kept = new Set(dirtyBlocks);
  const before = toBlockSnapshot(mine);
  const after = toBlockSnapshot(server);

  return SHEET_BLOCKS.filter((block) => !kept.has(block) && before[block] !== after[block]);
};

/** 갱신된 블록이 걸치는 섹션 목록(중복 제거). */
export const toUpdatedSections = (blocks: SheetBlock[]): SheetSectionId[] =>
  [...new Set(blocks.flatMap((block) => BLOCK_SECTIONS[block]))];
