export type Workplace = {
  id: number;
  companyId: number;
  name: string;
  address: string;
  bizNumber: string;
}

export type WorkplaceListItem = {
  id: number;
  companyId: number;
  companyName: string;
  workplaceName: string;
  address: string;
  bizNumber: string;
}

export type WorkplaceCreate = {
  companyId: number;
  name: string;
  bizNumber: string;
  address: string;
}

export type WorkplaceUpdate = {
  name: string;
  bizNumber: string;
  address: string;
}

export type ContractOverview = {
  recentContractCount: number;
  totalContractCount: number;
  expiringSoonContractCount: number;
  expiredContractCount: number;
}
