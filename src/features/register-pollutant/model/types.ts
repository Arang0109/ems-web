/**
 * 측정물질 채택 폼.
 *
 * 고객사는 지원 물질 가이드에 없는 물질을 만들 수 없으므로, 이 폼의 핵심 입력은 **어떤 가이드 항목을
 * 고를 것인가**(`catalogId`)다. 측정분야·측정방법·형태는 가이드가 정하므로 입력받지 않는다.
 *
 * `catalogId` 는 Select 값이라 문자열로 들고 있다가 제출 시 숫자로 바꾼다(미선택은 `""`).
 * `nameKr` 을 비워 두면 서버가 가이드의 표준 국문명을 복사한다.
 */
export type PollutantRegisterForm = {
  catalogId: string;
  nameKr: string;
  nameEn: string;
  equipment: string;
  testMethod: string;
}

export const getDefaultForm = (): PollutantRegisterForm => ({
  catalogId: "",
  nameKr: "",
  nameEn: "",
  equipment: "",
  testMethod: "",
});
