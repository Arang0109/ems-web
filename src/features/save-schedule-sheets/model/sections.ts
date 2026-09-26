// 측정 데이터 입력 화면의 섹션 메타 — 섹션 바로가기·이전/다음 이동·진행도 배지·블록 분할이 공유한다.
// 순서가 곧 이동 순서다. 여기에는 **정의만** 두고 판정(진행도·필수 칸)은 input/ 이 한다 —
// 필수 칸 규칙(required-fields)이 섹션 id 를 쓰고 진행도(section-progress)가 필수 칸 규칙을 쓰므로,
// 섹션 id 가 진행도 파일에 있으면 둘이 서로를 가리키게 된다.

export type SheetSectionId = "weather" | "moisture" | "exhaust" | "point" | "sample" | "gaseous";

/**
 * 입력 화면 전체의 섹션 id — 기록지 섹션에 측정계획 단위 **공통 정보**를 더한 것.
 *
 * `SheetSectionId` 와 분리해 둔다. 공통 정보는 `SheetForm` 이 아니라 `ScheduleBasicInfoForm` 을
 * 보므로, 진행도·필수 칸 판정(`getSectionProgress` 등)은 기록지 섹션만 받는 게 맞다.
 * 섹션 바로가기·펼침 상태처럼 화면 이동에만 쓰는 곳이 이 타입을 쓴다.
 */
export type EditorSectionId = "basic" | SheetSectionId;

export interface SheetSection {
  id: SheetSectionId;
  label: string;
  /** 입자상 시트에서만 노출되는 섹션 */
  particleOnly?: boolean;
}

/** 공통 정보 섹션 — 기록지 전환과 무관하게 늘 바로가기의 첫 항목이다 */
export const BASIC_INFO_SECTION: { id: EditorSectionId; label: string } = {
  id: "basic", label: "공통 정보",
};

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
