/**
 * 입력 칸 하나의 상태 색.
 *
 * shared 는 **왜** 그 색인지 모른다 — "이전 회차에서 불러온 값"·"검증 실패" 같은 의미는
 * 호출부(feature)가 판단해 톤으로만 넘긴다.
 *
 * - `info`   : 안내 — 값은 들어 있으나 확인이 필요하다
 * - `danger` : 오류 — 검증에 걸린 칸
 */
export type FieldTone = "default" | "info" | "danger";
