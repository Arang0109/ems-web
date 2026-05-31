import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';

import type { ContractRegisterRequest, ContractTableListResponse } from './dtos';
import type { Contract } from '../model/types';

export const contractApi = {
  getContractTableList: async (): Promise<ApiResponseMessage<ContractTableListResponse[]>> => {
    const res = await axiosPrivate.get('/contracts');
    return res.data;
  },

  registerContract: async (data: ContractRegisterRequest): Promise<ApiResponseMessage<Contract>> => {
    const res = await axiosPrivate.post('/contracts', data);
    return res.data;
  }
}