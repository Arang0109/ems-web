import { createContext } from "react";

/** 확인 버튼의 강조 강도. `danger` 는 되돌릴 수 없는 액션(삭제 등)에 쓴다. */
export type ConfirmTone = "default" | "danger";

export interface ConfirmOptions {
  title: string;
  description?: string;
  /** 기본 "확인" */
  confirmLabel?: string;
  /** 기본 "취소" */
  cancelLabel?: string;
  /** 기본 "default" */
  tone?: ConfirmTone;
}

/** 확인 다이얼로그를 띄우고 사용자의 선택을 기다린다. 확인이면 `true`. */
export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);
