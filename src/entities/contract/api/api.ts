import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';

import type { ContractRegisterRequest, ContractTableResponse } from './dtos';
import type { Contract } from '../model/types';

export const contractApi = {
  getContracts: async (contractId: number | null): Promise<ApiResponseMessage<ContractTableResponse[]>> => {
    const params = contractId != null ? { contractId } : {};
    const res = await axiosPrivate.get('/contracts', { params });
    return res.data;
  },

  registerContract: async (data: ContractRegisterRequest): Promise<ApiResponseMessage<Contract>> => {
    const res = await axiosPrivate.post('/contracts', data);
    return res.data;
  }
}