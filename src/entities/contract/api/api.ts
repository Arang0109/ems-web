import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';

import type { ContractTableListResponse } from './dtos';

export const contractApi = {
  getContractTableList: async (): Promise<ApiResponseMessage<ContractTableListResponse[]>> => {
    const res = await axiosPrivate.get('/contracts');
    return res.data;
  },
}