import { useNumericInput } from "@shared/model";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  /** 확정값 (미입력은 `""`). 타이핑 중인 미완성 값은 내부에만 있다 */
  value: string;
  onChange: (value: string) => void;

  /** 음수 허용 여부. 호스트가 `min` prop 에서 유도해 넘긴다 */
  allowNegative?: boolean;
  /** ↑/↓ 증감 폭 */
  step?: number;

  /** 테두리를 직접 그릴지 — 호스트(`UnitField`·표 셀)가 프레임을 소유하면 `"none"` */
  frame?: "bordered" | "none";
  /** 어떤 항목의 값인지 — 입력창과 부호 버튼의 접근성 이름이 된다 */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;

  /** 루트(프레임) 클래스 — 폭 지정 등 */
  className?: string;
  /** 입력창 클래스 — 호스트의 타이포·패딩을 맞출 때 */
  inputClassName?: string;
}

/**
 * 숫자 입력 — `<input type="number">` 의 대체 구현.
 *
 * 네이티브 숫자 입력은 **모바일 숫자 키패드에 `-` 키가 없어** 기온·정압처럼 음수가
 * 정상값인 항목을 현장에서 입력할 수 없다. 게다가 제어 컴포넌트에서는 미완성 입력
 * (`"-"`, `"12."`)에 대해 브라우저가 `e.target.value` 로 빈 문자열을 돌려줘 타이핑이 지워진다.
 *
 * 그래서 `type="text" inputMode="decimal"`(숫자 키패드 유지) 위에 마스킹·확정을 얹고,
 * 부호는 입력창 우측의 **± 버튼**으로 뒤집는다. `TimeField` 가 시각에 쓰는 것과 같은 구조다.
 *
 * - `allowNegative` 가 꺼지면 ± 버튼을 그리지 않고 `-` 입력도 받지 않는다
 * - ↑/↓ 로 `step` 만큼 증감한다. 네이티브와 달리 **휠 스크롤로는 값이 바뀌지 않는다**
 * - `value`/`onChange` 는 확정된 숫자 문자열과 `""` — 미완성 값은 내부에만 있다
 */
export const NumericField = ({
  id,
  value,
  onChange,
  allowNegative = true,
  step = 1,
  frame = "bordered",
  label,
  placeholder,
  disabled = false,
  readOnly = false,
  className,
  inputClassName,
}: Props) => {
  const { inputProps, toggleSign } = useNumericInput({
    value,
    onChange,
    allowNegative,
    step,
    disabled: disabled || readOnly,
  });

  return (
    <div
      className={cn(
        "flex min-w-0 items-stretch",
        frame === "bordered"
          ? [
              "h-12 overflow-hidden rounded-button border border-rule-dark bg-surface md:h-9.5",
              !disabled &&
                "focus-within:border-brand-primary focus-within:ring-3 focus-within:ring-brand-primary/12",
              disabled && "bg-rule/40",
            ]
          : "flex-1",
        className,
      )}
    >
      <input
        {...inputProps}
        id={id}
        // 호스트가 id 로 <label> 을 걸었다면 그쪽이 이름을 소유한다 (UnitField)
        aria-label={id ? undefined : label}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(
          "w-full min-w-0 bg-transparent px-3 text-ink outline-none",
          "tabular-nums placeholder:text-muted-ink",
          "disabled:cursor-not-allowed disabled:text-muted-ink",
          inputClassName,
        )}
      />

      {allowNegative && !readOnly && (
        <button
          type="button"
          // 포커스가 입력창에서 빠지면 blur 확정이 먼저 돌아 표시값이 튄다
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleSign}
          disabled={disabled}
          aria-label={label ? `${label} 부호 바꾸기` : "부호 바꾸기"}
          className={cn(
            "flex w-10 shrink-0 items-center justify-center text-body-2 text-muted-ink transition-colors md:w-9",
            "hover:text-brand-dark focus-visible:text-brand-dark focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:text-muted-ink/60",
          )}
        >
          <span aria-hidden>±</span>
        </button>
      )}
    </div>
  );
};
