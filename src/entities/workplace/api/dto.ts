import type { Grade } from "@shared/model";

export type WorkplaceListResponse = {
  id: number;
  companyId: number;
  companyName: string;
  workplaceName: string;
  bizNumber: string;
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  address: string;
  grade: Grade;
}

export type WorkplaceResponse = {
  id: number;
  companyId: number;
  name: string;
  bizNumber: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  grade: Grade;
}

export type ContractOverviewResponse = {
  recentContractCount: number;
  totalContractCount: number;
  expiringSoonContractCount: number;
  expiredContractCount: number;
}

export type WorkplaceRegisterRequest = {
  companyId: number;
  name: string;
  bizNumber: string;
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  address: string;
  grade: Grade;
}

export type WorkplaceUpdateRequest = {
  name: string;
  bizNumber: string;
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  address: string;
  grade: Grade;
}
