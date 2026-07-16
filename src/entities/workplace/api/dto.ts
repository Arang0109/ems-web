import type { Grade } from "@shared/model";

export type WorkplaceListResponse = {
  id: number;
  clientId: number;
  clientName: string;
  workplaceName: string;
  bizNumber: string;
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  detailAddress: string;
}

export type WorkplaceResponse = {
  id: number;
  clientId: number;
  name: string;
  bizNumber: string;
  zipcode: string;
  roadAddress: string;
  detailAddress: string;
  grade: Grade;
}

export type ContractOverviewResponse = {
  recentContractCount: number;
  totalContractCount: number;
  expiringSoonContractCount: number;
  expiredContractCount: number;
}

export type WorkplaceRegisterRequest = {
  clientId: number;
  name: string;
  bizNumber: string;
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  detailAddress: string;
  grade: Grade;
}

export type WorkplaceUpdateRequest = {
  name: string;
  bizNumber: string;
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  detailAddress: string;
  grade: Grade;
}
