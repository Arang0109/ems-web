import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { CompanyRegisterRequest, CompanyListResponse } from './dtos';
import type { Company } from '../model/types';

export const companyApi = {
  getCompanyList: async (): Promise<ApiResponseMessage<CompanyListResponse[]>> => {
    const res = await axiosPrivate.get('/companies');
    return res.data;
  },
  
  registerCompany: async (data: CompanyRegisterRequest): Promise<ApiResponseMessage<Company>> => {
    const res = await axiosPrivate.post('/companies', data);
    return res.data;
  },
};