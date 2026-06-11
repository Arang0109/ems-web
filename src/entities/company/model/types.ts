import type { CompanyResponse } from "../api/dto";

export type Company = CompanyResponse

export type CompanyCreate = {
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

export type CompanyUpdate = {
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