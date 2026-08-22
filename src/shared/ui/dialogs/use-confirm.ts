// 파괴적 액션 앞에 확인 단계를 세우는 접근 API
import { useContext } from "react";

import { ConfirmContext } from "./confirm-context";

/**
 * ```ts
 * const confirm = useConfirm();
 * if (!(await confirm({ title: "삭제", tone: "danger" }))) return;
 * ```
 */
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
};
