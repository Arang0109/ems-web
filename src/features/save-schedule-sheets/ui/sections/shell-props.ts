import type { SectionProgress } from "../../model/section-progress";

/**
 * SheetFormView 가 각 섹션 카드에 주입하는 공통 셸 props.
 * 섹션의 열림 상태·진행도·하단 이동 버튼은 모두 SheetFormView 가 소유한다
 * (섹션 간 이동을 한곳에서 제어하기 위함).
 */
export interface SectionShellProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: SectionProgress;
}

/** 섹션 안의 입력 필드 그리드 — 모바일 1열 → md 2열 → xl 3열 */
export const FIELD_GRID = "grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2 xl:grid-cols-6";
