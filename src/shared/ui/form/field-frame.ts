import { cn } from "@/lib/utils";

/**
 * 마스킹 입력(`TimeField`·`NumericField`)의 프레임과 입력창 클래스.
 *
 * 두 컴포넌트는 같은 구조(텍스트 입력 + 우측 보조 버튼)라 픽셀이 같아야 한다 — 문자열을 복사해 두면
 * 한쪽만 고쳐져 갈라지므로 여기서만 정의한다.
 *
 * - `"bordered"` : 스스로 테두리·포커스 링을 그린다(단독 사용)
 * - `"none"`     : 호스트(`UnitField`·표 셀)가 프레임을 소유한다 — 남은 폭만 채운다
 */
export type FieldFrame = "bordered" | "none";

export const fieldFrameClass = (frame: FieldFrame, disabled: boolean) =>
  frame === "bordered"
    ? cn(
        "h-12 overflow-hidden rounded-button border border-rule-dark bg-surface md:h-9.5",
        !disabled && "focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/12",
        disabled && "bg-rule/40",
      )
    : "flex-1";

export const FIELD_INPUT_CLASS = cn(
  "w-full min-w-0 bg-transparent px-3 text-ink outline-none",
  "tabular-nums placeholder:text-muted-ink",
  "disabled:cursor-not-allowed disabled:text-muted-ink",
);
