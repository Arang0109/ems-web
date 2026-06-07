import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';

import type { ContractRegisterRequest, ContractUpdateRequest, ContractTableResponse, ContractResponse } from './dtos';
import type { Contract } from '../model/types';

export const contractApi = {
  getContracts: async (contractId: number | null): Promise<ApiResponseMessage<ContractTableResponse[]>> => {
    const params = contractId != null ? { contractId } : {};
    const res = await axiosPrivate.get('/contracts', { params });
    return res.data;
  },

  getContract: async (contractId: number): Promise<ApiResponseMessage<ContractResponse>> => {
    const res = await axiosPrivate.get(`/contracts/${contractId}`);
    return res.data;
  },

  registerContract: async (data: ContractRegisterRequest): Promise<ApiResponseMessage<Contract>> => {
    const res = await axiosPrivate.post('/contracts', data);
    return res.data;
  },

  updateContract: async (contractId: number, data: ContractUpdateRequest): Promise<ApiResponseMessage<Contract>> => {
    const res = await axiosPrivate.put(`/contracts/${contractId}`, data);
    return res.data;
  },
}