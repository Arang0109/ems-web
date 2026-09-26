import { useState } from "react";

import { useCheckSamplingRecordTemplateAction } from "@entities/schedule";
import type { TemplateCheckResult } from "@entities/schedule";
import { toast } from "@shared/ui/toasts";

interface Params {
  /** 폼에 올린 파일. 바뀌면 지난 결과는 다른 파일의 것이므로 감춘다. */
  file: File | null;
}

/**
 * 채취기록부 양식을 등록하기 전에 이름 오류를 잡는다. 렌더링은 없는 이름을 오류 없이 빈칸으로
 * 넘기므로 양식을 고칠 수 있는 관리자가 올리는 이 시점이 가장 값진 검사 자리다. 등록을 막지는 않는다.
 */
export const useTemplateCheck = ({ file }: Params) => {
  const { checkSamplingRecordTemplate, isLoading } = useCheckSamplingRecordTemplateAction();

  const [checked, setChecked] = useState<{ file: File; result: TemplateCheckResult } | null>(null);

  const handleCheck = async () => {
    if (!file || isLoading) return;

    try {
      const result = await checkSamplingRecordTemplate(file);
      setChecked({ file, result });
      if (result.valid) toast.success("양식에 이름 오류가 없습니다.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "양식 검사에 실패했습니다.";
      toast.error(message);
    }
  };

  return {
    result: checked && checked.file === file ? checked.result : null,
    isChecking: isLoading,
    handleCheck,
  };
};
