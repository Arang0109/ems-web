import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { Workplace, ContractOverview } from '../model/workplace-types';

export const workplaceApi = {
  getWorkplaces: async (): Promise<ApiResponseMessage<Workplace[]>> => {
    const res = await axiosPrivate.get('/workplaces');
    return res.data;
  },

  getContractOverview: async (): Promise<ApiResponseMessage<ContractOverview>> => {
    const res = await axiosPrivate.get('/workplaces/contract-summary');
    return res.data;
  },
}