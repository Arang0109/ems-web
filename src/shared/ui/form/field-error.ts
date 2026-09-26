/**
 * 폼 필드의 에러 표시 계약 — 모든 폼 컨트롤이 같은 두 prop 으로 받는다.
 *
 * - `errorMessage` : 칸 아래 빨간 문구 + 라벨·테두리 빨강. 서버/검증 에러는 이것으로 넘긴다.
 * - `invalid`      : 문구 없이 **빨갛게만** 칠한다. 문구를 다른 곳(토스트·폼 상단)에서 이미 보여줄 때만 쓴다.
 *
 * 둘 중 하나라도 있으면 invalid 다.
 */
export interface FieldErrorProps {
  errorMessage?: string;
  invalid?: boolean;
}

export const isFieldInvalid = ({ errorMessage, invalid }: FieldErrorProps) => !!invalid || !!errorMessage;
