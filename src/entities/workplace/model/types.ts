import type { WorkplaceResponse, WorkplaceListResponse, ContractOverviewResponse } from '../api/dto';

export type Workplace = WorkplaceResponse;

export type WorkplaceListItem = WorkplaceListResponse;

export type ContractOverview = ContractOverviewResponse;

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
