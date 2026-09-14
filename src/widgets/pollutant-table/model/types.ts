export type PollutantTableRow = {
  /** 이 고객사의 측정물질 id. 상세 모달 대상 지목에도 쓴다 */
  id: number;
  /** 전역 물질 키(`NOX` 등) */
  code: string;
  field: string
  nameKr: string;
  nameEn: string;
  /** 측정방식 분류 라벨(카탈로그). 미분류면 EMPTY */
  mode: string;
  method: string;
  /** 이 항목에 적용되는 채취시간 표기(`30분`). 항목별 오버라이드면 `60분 (항목)`. 미지정은 EMPTY */
  samplingMinutes: string;
  phase: string;
  equipment: string;
  testMethod: string;
}
