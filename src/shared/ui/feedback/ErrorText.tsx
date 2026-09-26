import { cn } from "@/lib/utils";

interface Props {
  /** 비어 있으면 아무것도 그리지 않는다 — `{error && …}` 조건을 호출부마다 쓰지 않게 한다 */
  children?: React.ReactNode;
  className?: string;
}

/**
 * 폼·스텝 하단의 에러 한 줄 — 특정 칸에 묶이지 않는 실패(저장 실패·스텝 검증 등).
 *
 * 칸에 묶인 에러는 각 컨트롤의 `errorMessage` 를 쓴다. 나타날 때 스크린리더가 읽도록 `role="alert"` 다.
 */
export const ErrorText = ({ children, className }: Props) =>
  children ? (
    <p role="alert" className={cn("text-body-2 text-danger", className)}>
      {children}
    </p>
  ) : null;
