// 자릿수 코드(사업자번호·전화번호)용 `unformatNumber` 를 여기 쓰면 안 된다 —
// `/\D/g` 라 부호와 소수점을 함께 지운다.

/**
 * 자릿수 상한. **부호(`-`)와 소수점은 세지 않는다.**
 *
 * 값의 범위가 아니라 **입력 자릿수**를 정한다 — 범위 검증은 validator 몫이고,
 * 여기서는 오타 한 자리(`35.0` → `350.0`)가 아예 안 들어가게 하는 것이 목적이다.
 */
export interface DigitLimits {
  /** 정수부 최대 자릿수. **선행 0 은 값이 아니므로 세지 않는다** (`"007"` 은 1 자리) */
  maxIntDigits?: number;
  /**
   * 소수부 최대 자릿수. **후행 0 은 유효숫자이므로 센다** (`"1.50"` 은 2 자리).
   * `0` 이면 소수점 자체를 받지 않는다 — "정수만 적는 칸" 이라는 선언이다.
   */
  maxDecimals?: number;
}

interface MaskOptions extends DigitLimits {
  allowNegative?: boolean;
}

/**
 * 정수부를 상한까지 자른다. **선행 0 은 자릿수에서 빼고 센다** —
 * 값이 아니라 자리표이고, `normalizeNumericInput` 이 확정할 때 어차피 지우는 자리다.
 * 세어 버리면 `"0000123"` 처럼 0 부터 치는 입력이 도중에 막힌다.
 */
const clampIntDigits = (head: string, max: number | undefined): string => {
  if (max === undefined) return head;

  const zeros = head.match(/^0+/)?.[0] ?? "";
  const body = head.slice(zeros.length);

  return body.length > max ? zeros + body.slice(0, max) : head;
};

/**
 * 타이핑 중인 값을 숫자 골격으로 마스킹한다. **미완성 값을 그대로 허용**하므로
 * (`"-"`, `"12."`, `"-."`) 결과가 항상 유효한 숫자는 아니다 — 확정은 `normalizeNumericInput` 이 한다.
 *
 * - 숫자·`-`·`.` 외의 문자는 버린다 (콤마·공백·`e` 포함)
 * - `-` 는 맨 앞 1 개만 남는다. `allowNegative` 가 꺼져 있으면 전부 버린다
 * - `.` 은 1 개만 남는다 (`"1.2.3"` → `"1.23"`)
 * - 자릿수 상한(`maxIntDigits`·`maxDecimals`)을 넘는 자리는 **앞자리를 남기고 버린다**.
 *   끝에서 타이핑하면 친 글자가 안 들어간 것과 같고, 붙여넣기는 앞자리가 남아 원인이 보인다.
 */
export const maskNumericInput = (
  raw: string,
  { allowNegative = true, maxIntDigits, maxDecimals }: MaskOptions = {},
): string => {
  const isNegative = allowNegative && raw.trimStart().startsWith("-");

  const digits = raw.replace(/[^0-9.]/g, "");
  const [head = "", ...rest] = digits.split(".");

  const int = clampIntDigits(head, maxIntDigits);
  // 소수를 안 받는 칸에서는 소수점을 자리표로도 두지 않는다 — `"12."` 로 멈출 곳이 없다.
  const hasDot = rest.length > 0 && maxDecimals !== 0;
  const frac = maxDecimals === undefined ? rest.join("") : rest.join("").slice(0, maxDecimals);

  const body = hasDot ? `${int}.${frac}` : int;

  // 부호만 남은 상태(`"-"`)도 유지한다 — 부호부터 누르고 숫자를 치는 흐름이 끊기지 않게.
  return isNegative ? `-${body}` : body;
};

/** 부호를 뒤집는다. 빈 값이면 `"-"` 를 돌려줘 부호부터 누르는 흐름을 지원한다. */
export const toggleNumericSign = (value: string): string =>
  value.startsWith("-") ? value.slice(1) : `-${value}`;

/**
 * 미완성 입력을 확정된 숫자 문자열로 보정한다. 값이 아닌 입력(`"-"`·`"."`·`"-."`)은 `""` —
 * 0 으로 바꾸지 않는다(빈 값과 0 은 서버에서 "미지정"과 "0" 으로 갈린다).
 *
 * `"12."` → `"12"`, `".5"` → `"0.5"`, `"-.5"` → `"-0.5"`, `"007"` → `"7"`, `"-0"` → `"0"`.
 * 후행 0 은 남긴다 — 측정값의 `1.50` 은 유효숫자 정보이므로 `1.5` 로 줄이지 않는다.
 *
 * **자릿수 제한을 다시 보지 않는다.** 확정이 자릿수를 늘리는 경우는 `".5"` → `"0.5"` 뿐이고
 * 그 `0` 은 선행 0 이라 세지 않는다. 나머지 보정은 전부 줄이는 방향이므로
 * **마스킹을 통과한 값은 확정 뒤에도 반드시 제한 안**이다 (`numeric-input.test.ts` 가 못박는다).
 */
export const normalizeNumericInput = (value: string): string => {
  const masked = maskNumericInput(value);
  const isNegative = masked.startsWith("-");

  const [intPart = "", fracPart = ""] = (isNegative ? masked.slice(1) : masked).split(".");
  if (!intPart && !fracPart) return "";

  const int = intPart.replace(/^0+(?=\d)/, "") || "0";
  const normalized = fracPart ? `${int}.${fracPart}` : int;

  // `-0` 을 만들지 않는다 — 부호만 누르고 지운 흔적이 값으로 남는다.
  return isNegative && Number(normalized) !== 0 ? `-${normalized}` : normalized;
};

/**
 * 확정된 숫자 문자열이 자릿수 제한 **밖**인지.
 *
 * ↑/↓ 증감을 막는 데 쓴다. 타이핑은 초과분을 버리면 되지만(친 글자가 안 들어간 것과 같다),
 * 증감은 자르면 의도와 다른 **제3의 값**이 된다 — `9999 + 1` → `10000` → `"1000"`.
 * 그래서 증감은 자르지 않고 아예 움직이지 않는다.
 *
 * 판정 규칙을 두 번 적지 않으려고 **마스킹 결과와 비교**한다 — 마스킹을 통과해도 모양이
 * 그대로면 제한 안이라는 뜻이다. 부호는 `allowNegative` 를 켜고 보므로 자릿수에 끼지 않는다.
 * 지수 표기(`"1e-7"`)는 마스킹이 `e` 를 지우므로 "밖" 으로 본다 — 타이핑으로 만들 수 없는
 * 값에 증감으로 뛰어가지 않게 하려는 것이라 의도한 결과다.
 */
export const exceedsDigitLimits = (value: string, limits: DigitLimits = {}): boolean =>
  maskNumericInput(value, { ...limits, allowNegative: true }) !== value;
