import type { Grade } from "@shared/model";

export type WorkplaceListResponse = {
  id: number;
  clientId: number;
  clientName: string;
  workplaceName: string;
  bizNumber: string;
  businessCategory: string;   // 업종
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  detailAddress: string;
  facilityManager: string;
  samplingWitness: string;
  grade: Grade;
}

export type WorkplaceResponse = {
  id: number;
  clientId: number;
  name: string;
  bizNumber: string;
  businessCategory: string;
  zipcode: string;
  roadAddress: string;
  detailAddress: string;
  facilityManager: string;
  samplingWitness: string;
  grade: Grade;
}

export type WorkplaceRegisterRequest = {
  clientId: number;
  name: string;
  bizNumber: string;
  businessCategory: string;
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  detailAddress: string;
  facilityManager: string;
  samplingWitness: string;
  grade: Grade;
}

export type WorkplaceUpdateRequest = {
  name: string;
  bizNumber: string;
  businessCategory: string;
  zipcode: string;           // 우편번호
  roadAddress: string;        // 도로명 주소
  detailAddress: string;
  facilityManager: string;
  samplingWitness: string;
  grade: Grade;
}
