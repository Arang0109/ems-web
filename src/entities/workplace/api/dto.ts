export type WorkplaceListResponse = {
  id: number;
  companyId: number;
  companyName: string;
  workplaceName: string;
  address: string;
  bizNumber: string;
}

export type WorkplaceResponse = {
  id: number;
  companyId: number;
  name: string;
  address: string;
  bizNumber: string;
}

export type ContractOverviewResponse = {
  recentContractCount: number;
  totalContractCount: number;
  expiringSoonContractCount: number;
  expiredContractCount: number;
}

export type WorkplaceRegisterRequest = {
  companyId: number,
  name: string,
  bizNumber: string,
  address: string,
}

export type WorkplaceUpdateRequest = {
  name: string,
  bizNumber: string,
  address: string,
}
