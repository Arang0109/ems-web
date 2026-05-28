import type { Company } from "@entities/company";
import type { ContractStatus, Grade } from "@shared/model";

export type Workplace = {
  id: number;
  companyId: number;
  name: string;
  address: string;                  // 주소
  bizNumber: string;                // 사업자번호 (xxx-xx-xxxxx)
  manager: string;
  businessCategory: string;
  grade: Grade;
  remark: string;
  status: ContractStatus; 
  createdAt: string;
  modifiedAt: string;
}

export type WorkplaceDetail = {
  company: Company;
  workplace: Workplace;
}

export type workplaceTableD = {
  id: number;
  companyName: string;
  workplaceName: string;              // 거래처명
  address: string;                  // 주소
  status: ContractStatus;           // 계약상태
  createdAt: string;                // 등록일 (YYYY-MM-DD)
}

export type ContractOverview = {
  recentContractCount: number;
  totalContractCount: number;
  expiringSoonContractCount: number;
  expiredContractCount: number;
}