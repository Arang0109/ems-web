import { useState } from "react";

import { useCheckSamplingRecordTemplateAction } from "@entities/schedule";
import type { TemplateCheckResult } from "@entities/schedule";
import { toast } from "@shared/ui/toasts";

interface Params {
  /** 검사할 양식 파일을 얻는다 — 선택한 문서 버전을 내려받는다. */
  resolveTemplateFile: () => Promise<File>;
  /** 어느 양식(문서·버전)을 검사했는지 표시하는 키. 선택이 바뀌면 지난 결과를 보이지 않는다. */
  selectionKey: string | null;
}

/**
 * 채취기록부 양식 검사. 렌더링은 없는 이름을 오류 없이 빈칸으로 넘기므로, 내려받기 전에
 * 이름 오류를 셀 주소와 함께 보여 주는 것이 이 훅의 일이다. 검사 결과가 나빠도 내려받기는 막지 않는다 —
 * 빈칸을 감수하고 받을지는 사용자가 정한다.
 */
export const useTemplateCheck = ({ resolveTemplateFile, selectionKey }: Params) => {
  const { checkSamplingRecordTemplate, isLoading } = useCheckSamplingRecordTemplateAction();

  const [checked, setChecked] = useState<{ key: string; result: TemplateCheckResult } | null>(null);
  // 템플릿 내려받기 구간까지 덮는 로딩. entity 훅의 isLoading 은 검사 요청 구간만 덮는다.
  const [isResolving, setIsResolving] = useState(false);

  const handleCheck = async () => {
    if (selectionKey == null || isResolving || isLoading) return;

    setIsResolving(true);
    try {
      const file = await resolveTemplateFile();
      const result = await checkSamplingRecordTemplate(file);
      setChecked({ key: selectionKey, result });
      if (result.valid) toast.success("양식에 이름 오류가 없습니다.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "양식 검사에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsResolving(false);
    }
  };

  return {
    // 선택이 바뀌면 지난 결과는 다른 양식의 것이므로 감춘다.
    result: checked && checked.key === selectionKey ? checked.result : null,
    isChecking: isResolving || isLoading,
    handleCheck,
  };
};
