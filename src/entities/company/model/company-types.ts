import type { ActiveStatus } from "@shared/model";

export interface Company {
  id: number;
  companyName: string;      // 거래처명
  workplaceName: string;           // 사업장명
  address: string;          // 주소
  ceoName: string; // 대표자
  bizNumber: string; // 사업자번호 (xxx-xx-xxxxx)
  createdAt: string;   // 등록일 (YYYY-MM-DD)
  status: ActiveStatus;  // 상태
}
