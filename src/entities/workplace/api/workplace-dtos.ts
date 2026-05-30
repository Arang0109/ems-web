export type Workplace = {
  id: number;
  companyId: number;
  name: string;               // 측정대상 사업장
  address: string;            // 측정대상 사업장 주소
  bizNumber: string;
}

export type WorkplaceTableCols = {
  id: number;
  companyId: number;
  companyName: string;
  workplaceName: string;
  address: string;
  bizNumber: string;
}