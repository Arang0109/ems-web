import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { Workplace, workplaceTableD, ContractOverview, WorkplaceDetail } from '../model/workplace-types';

export const workplaceApi = {
  getWorkplaces: async (): Promise<ApiResponseMessage<Workplace[]>> => {
    const res = await axiosPrivate.get('/workplaces');
    return res.data;
  },

  getWorkplaceTableDatas: async (): Promise<ApiResponseMessage<workplaceTableD[]>> => {
    const res = await axiosPrivate.get('/workplaces/summary');
    return res.data;
  },

  getWorkplaceDetail: async (workplaceId: number): Promise<ApiResponseMessage<WorkplaceDetail>> => {
    const res = await axiosPrivate.get(`/workplaces/${workplaceId}'`);
    return res.data;
  },

  getContractOverview: async (): Promise<ApiResponseMessage<ContractOverview>> => {
    const res = await axiosPrivate.get('/workplaces/contract-summary');
    return res.data;
  },
}