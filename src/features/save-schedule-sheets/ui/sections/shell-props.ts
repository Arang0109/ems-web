import type { ReactNode } from "react";

import type { FieldTone } from "@shared/model";
import type { SectionHighlight } from "@shared/ui/accordion";
import type { BadgeTone } from "@shared/ui/badges";

import type { SheetFieldPath } from "../../model/required-fields";
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
  progressTone: BadgeTone;
  /** 헤더 강조 배지 — 방금 갱신됨 / 불러옴 N / 미입력 N */
  highlights?: SectionHighlight[];
  /** 헤더 우측 액션 — 불러온 값이 남아 있는 섹션의 `전체 확인` 버튼 */
  trailing?: ReactNode;
}

/**
 * 입력 칸 하나의 표시 상태를 묻는 창구.
 *
 * 섹션마다 렌더 방식이 갈리므로(직접 나열 · 스펙 배열 · 회차 반복) 칸을 가리키는 공통 언어가
 * 필요하다. 그 언어가 경로(`SheetFieldPath`)이고, 판정 규칙은 전부 `SheetsEditor` 가 소유한다 —
 * 섹션은 "이 칸은 무슨 색인가"만 물어본다.
 *
 * **`SectionShellProps` 와 섞지 않는다.** 섹션들이 셸 props 를 `SectionAccordion` 에
 * 그대로 스프레드하므로, 여기 들어가면 아코디언에 없는 prop 이 흘러 들어간다.
 */
export interface FieldStateProps {
  fieldTone: (path: SheetFieldPath) => FieldTone;
  /** 그 칸에 포커스가 들어왔다 = 눈으로 확인했다 */
  onFieldFocus: (path: SheetFieldPath) => void;
}

/** 섹션 안의 입력 필드 그리드 — 모바일 1열 → md 2열 → xl 3열 */
export const FIELD_GRID = "grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2 xl:grid-cols-6";
