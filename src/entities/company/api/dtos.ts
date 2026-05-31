export type CompanyTableListResponse = {
  id: number;
  name: string;            
  bizNumber: string;       
  ceoName: string;   
  address: string;            

  manager: string;
  email: string;        
  tell: string;       
}

export type CompanyRegisterRequest = {
  name: string;
  bizNumber: string;
  ceoName: string;
  address: string;

  manager: string;
  email: string;
  tell: string;
}