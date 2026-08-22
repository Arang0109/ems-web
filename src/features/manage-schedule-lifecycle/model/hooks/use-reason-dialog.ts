import { useState } from "react";

import { validateReason } from "../validator";

interface Params {
  /** 검증을 통과한 사유로 실제 액션을 실행한다. 예외를 던지면 다이얼로그는 열린 채로 남는다. */
  onSubmit: (reason: string) => Promise<void>;
}

export interface ReasonDialogState {
  isOpen: boolean;
  reason: string;
  error: string | null;
  setReason: (value: string) => void;
  setOpen: (open: boolean) => void;
  open: () => void;
  submit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}

/**
 * 사유를 받아 확정하는 다이얼로그의 상태. 취소와 재개방이 같은 형태라 함께 쓴다.
 *
 * 실패 시 다이얼로그를 닫지 않는 것이 중요하다 — 서버가 거부했는데 닫아 버리면
 * 사용자가 애써 쓴 사유가 사라진다.
 */
export const useReasonDialog = ({ onSubmit }: Params): ReasonDialogState => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setReason("");
    setError(null);
    setIsOpen(true);
  };

  const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const message = validateReason(reason);
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    void onSubmit(reason.trim())
      .then(() => setIsOpen(false))
      .catch(() => { /* 실패 문구는 호출부가 토스트로 알린다. 입력 내용은 남긴다. */ });
  };

  return {
    isOpen, reason, error,
    setReason: (value: string) => { setReason(value); if (error) setError(null); },
    setOpen: setIsOpen,
    open,
    submit,
  };
};
