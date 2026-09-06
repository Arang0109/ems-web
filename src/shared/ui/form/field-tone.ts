import type { FieldTone } from "@shared/model";

/**
 * 톤별 입력 프레임 색 — **테두리를 직접 그리는 입력**이 공유한다 (`UnitField`, `InlineInput`).
 * `default` 는 각 컴포넌트의 기본/읽기전용/비활성 분기가 맡으므로 여기 없다.
 *
 * 표 셀(`TableInputCell`·`TableSelectCell`)은 테두리가 표의 것이라 면 색만 바꾼다 — 별개 맵이다.
 */
export const FIELD_TONE_FRAME: Record<Exclude<FieldTone, "default">, string> = {
  info: "border-info bg-info-soft",
  danger: "border-danger bg-danger-soft",
};

/** 톤에 해당하는 프레임 클래스. `default` 면 아무것도 칠하지 않는다 */
export const toneFrameClass = (tone: FieldTone): string | false =>
  tone !== "default" && FIELD_TONE_FRAME[tone];
