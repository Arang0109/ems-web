import type { ContractStatus } from "@shared/model";

export type Company = {
  id: number;
  name: string;              // 거래처명
  address: string;                  // 주소
  ceoName: string;                  // 대표자
  bizNumber: string;                // 사업자번호 (xxx-xx-xxxxx)
  remark: string;
  status: ContractStatus;           // 계약상태
  createdAt: Date;                // 등록일 (YYYY-MM-DD)
  modifiedAt: Date;             // 등록일 (YYYY-MM-DD)
}