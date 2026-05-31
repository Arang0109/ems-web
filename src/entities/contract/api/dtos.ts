import type { MeasurementField } from "@shared/model";

export type ContractTableListResponse = {
  field: MeasurementField;
  companyName: string;
  workplaceName: string;
  contractName: string;              // 용역명
  taskPeriod: string;

  contractStatus: string;

  contractDate: string;             // 계약일자
}