export type ContractTableRow = {
  id: number;
  worklaceId: number;
  field: string;
  companyName: string;
  workplaceName: string;
  contractName: string;              // 용역명
  taskPeriod: string;

  contractStatus: string;

  contractDate: string;             // 계약일자
}