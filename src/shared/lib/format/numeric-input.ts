// 자릿수 코드(사업자번호·전화번호)용 `unformatNumber` 를 여기 쓰면 안 된다 —
// `/\D/g` 라 부호와 소수점을 함께 지운다.
interface MaskOptions {
  allowNegative?: boolean;
}

/**
 * 타이핑 중인 값을 숫자 골격으로 마스킹한다. **미완성 값을 그대로 허용**하므로
 * (`"-"`, `"12."`, `"-."`) 결과가 항상 유효한 숫자는 아니다 — 확정은 `normalizeNumericInput` 이 한다.
 *
 * - 숫자·`-`·`.` 외의 문자는 버린다 (콤마·공백·`e` 포함)
 * - `-` 는 맨 앞 1 개만 남는다. `allowNegative` 가 꺼져 있으면 전부 버린다
 * - `.` 은 1 개만 남는다 (`"1.2.3"` → `"1.23"`)
 */
export const maskNumericInput = (raw: string, { allowNegative = true }: MaskOptions = {}): string => {
  const isNegative = allowNegative && raw.trimStart().startsWith("-");

  const digits = raw.replace(/[^0-9.]/g, "");
  const [head, ...rest] = digits.split(".");
  const body = rest.length > 0 ? `${head}.${rest.join("")}` : head;

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
