import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import type { TemplateCheckResult } from "./types";
import { scheduleApi } from "../api/api";
import { toTemplateCheckResult } from "../api/mapper";

/**
 * 채취기록부 템플릿 검사. 서버 상태를 바꾸지 않으므로 무효화할 키가 없다 —
 * 요청형 조회라 query 가 아니라 mutation 으로 둔다(파일을 올리는 호출은 캐시할 대상이 아니다).
 */
export const useCheckSamplingRecordTemplateAction = () => {
  const { run, isLoading, error } = useEntityMutation(
    async (template: File): Promise<TemplateCheckResult> =>
      toTemplateCheckResult(unwrapMessage(await scheduleApi.checkSamplingRecordTemplate(template))),
    { fallbackMessage: "템플릿 검사에 실패했습니다." },
  );

  return { checkSamplingRecordTemplate: run, isLoading, error };
};
