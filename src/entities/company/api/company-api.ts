import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { Company } from './company-dtos';

export const companyApi = {
  getCompanies: async (): Promise<ApiResponseMessage<Company[]>> => {
    const res = await axiosPrivate.get('/companies');
    return res.data;
  },
};