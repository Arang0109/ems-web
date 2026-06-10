export type CompanyResponse = {
  id: number;
  name: string;               // 측정대행 의뢰기관
  bizNumber: string;          // 사업자등록번호 (xxx-xx-xxxxx)
  representative: string;     // 대표자
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  address: string;            // 상세주소

  manager: string;            // 측정대행 의뢰기관 담당자
  email: string;              // E-mail
  tel: string;                // 전화번호
}

export type CompanyRegisterRequest = {
  name: string;
  bizNumber: string;
  representative: string;
  zipcode: string;
  roadAddress: string;
  address: string;

  manager: string;
  email: string;
  tel: string;
}

export type CompanyUpdateRequest = {
  name: string;
  bizNumber: string;
  representative: string;
  zipcode: string;
  roadAddress: string;
  address: string;

  manager: string;
  email: string;
  tel: string;
}