export type CompanyStatus = 'active' | 'inactive';

export interface Company {
  id: number;
  name: string;           // 거래처명
  address: string;          // 주소
  businessNumber: string; // 사업자번호 (xxx-xx-xxxxx)
  representative: string; // 대표자
  remark: string;        // 비고
  registeredAt: string;   // 등록일 (YYYY-MM-DD)
  workplaces: {
    name: string;           // 사업장명
    address: string;        // 사업장 주소
    businessNumber: string; // 사업장 사업자번호
    representative: string; // 사업장 대표자
    registeredAt: string;   // 사업장 등록일 (YYYY-MM-DD)
    status: CompanyStatus;  // 사업장 상태
  }[];
  status: CompanyStatus;  // 상태
}
