export type CompanyStatus = 'active' | 'inactive';

export interface Company {
  id: number;
  name: string;           // 거래처명
  businessNumber: string; // 사업자번호 (xxx-xx-xxxxx)
  representative: string; // 대표자
  phone: string;          // 연락처
  address: string;        // 주소
  registeredAt: string;   // 등록일 (YYYY-MM-DD)
  status: CompanyStatus;  // 상태
}
