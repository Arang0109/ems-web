export type CompanyListResponse = {
  id: number;
  name: string;            
  bizNumber: string;       
  representative: string;   
  address: string;

  manager: string;
  email: string;
  tel: string;
}

export type CompanyRegisterRequest = {
  name: string;
  bizNumber: string;
  representative: string;
  address: string;

  manager: string;
  email: string;
  tel: string;
}