import type { Grade } from '@shared/model';
import type { WorkplaceResponse, WorkplaceListResponse } from '../api/dto';

export type Workplace = WorkplaceResponse;

export type WorkplaceListItem = WorkplaceListResponse;

export type WorkplaceCreate = {
  clientId: number;
  name: string;
  bizNumber: string;
  businessCategory: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  facilityManager: string;
  samplingWitness: string;
  grade: Grade;
}

export type WorkplaceUpdate = {
  name: string;
  bizNumber: string;
  businessCategory: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  facilityManager: string;
  samplingWitness: string;
  grade: Grade
}
