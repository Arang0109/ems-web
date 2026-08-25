import type { FieldTone } from "@shared/model";

import type { SheetFieldPath } from "../model/required-fields";
import type { SheetSectionId } from "../model/section-progress";

/**
 * 칸 단위 강조의 판정 창구.
 *
 * 규칙은 전부 `SheetsEditor` 가 소유한다 — 불러온 값인지(`useBorrowedFields`)와
 * 저장을 눌렀는지(`showMissing`)를 둘 다 아는 곳이 거기뿐이기 때문이다.
 * `SheetFormView` 와 섹션들은 "이 칸은 무슨 색인가"만 물어본다.
 */
export interface SheetFieldState {
  fieldTone: (path: SheetFieldPath) => FieldTone;
  /** 그 칸에 포커스가 들어왔다 = 눈으로 확인했다 */
  onFieldFocus: (path: SheetFieldPath) => void;
  /** 섹션 헤더의 `불러옴 N` 배지 */
  borrowedCountOf: (id: SheetSectionId) => number;
  /** 섹션 헤더의 `전체 확인` — 그 섹션의 불러온 값을 한 번에 확인 처리한다 */
  onAcknowledgeSection: (id: SheetSectionId) => void;
  /** 저장을 한 번 눌렀는가 — 미입력 필수 칸의 빨강 표시 스위치 */
  showMissing: boolean;
}
