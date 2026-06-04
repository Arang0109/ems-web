export type Company = {
  id: number;
  name: string;               // 측정대행 의뢰기관
  bizNumber: string;          // 사업자등록번호 (xxx-xx-xxxxx)
  representative: string;            // 대표자
  address: string;            // 측정대행 의뢰기관 주소

  manager: string;            // 측정대행 의뢰기관 담당자
  email: string;              // E-mail
  tel: string;               // 전화번호
}