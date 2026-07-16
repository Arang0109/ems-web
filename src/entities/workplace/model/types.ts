import type { Grade } from '@shared/model';
import type { WorkplaceResponse, WorkplaceListResponse, ContractOverviewResponse } from '../api/dto';

export type Workplace = WorkplaceResponse;

export type WorkplaceListItem = WorkplaceListResponse;

export type ContractOverview = ContractOverviewResponse;

export type WorkplaceCreate = {
  clientId: number;
  name: string;
  bizNumber: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  grade: Grade;
}

export type WorkplaceUpdate = {
  name: string;
  bizNumber: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  grade: Grade
}
