import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { ContractOverview } from '../model/workplace-types';
import type { Workplace, WorkplaceTableCols } from './workplace-dtos';

export const workplaceApi = {
  getWorkplaces: async (): Promise<ApiResponseMessage<Workplace[]>> => {
    const res = await axiosPrivate.get('/workplaces');
    return res.data;
  },

  getWorkplacesByCompany: async (companyId: number): Promise<ApiResponseMessage<WorkplaceTableCols[]>> => {
    const res = await axiosPrivate.get(`/workplaces?companyId=${companyId}`);
    return res.data;
  },

  getContractOverview: async (): Promise<ApiResponseMessage<ContractOverview>> => {
    const res = await axiosPrivate.get('/workplaces/contract-summary');
    return res.data;
  },
}