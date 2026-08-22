export type PollutantTableRow = {
  /** 이 고객사의 측정물질 id. 상세 모달 대상 지목에도 쓴다 */
  id: number;
  /** 전역 물질 키(`NOX` 등) */
  code: string;
  field: string
  nameKr: string;
  nameEn: string;
  method: string;
  phase: string;
  equipment: string;
  testMethod: string;
}
