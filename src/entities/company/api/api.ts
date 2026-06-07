import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { CompanyRegisterRequest, CompanyResponse, CompanyUpdateRequest } from './dto';

export const companyApi = {
  getCompanyList: async (): Promise<ApiResponseMessage<CompanyResponse[]>> => {
    const res = await axiosPrivate.get('/companies');
    return res.data;
  },
  
  registerCompany: async (data: CompanyRegisterRequest): Promise<ApiResponseMessage<CompanyResponse>> => {
    const res = await axiosPrivate.post('/companies', data);
    return res.data;
  },

  deleteCompany: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/companies/${id}`);
    return res.data;
  },

  updateCompany: async (id: number, data: CompanyUpdateRequest): Promise<ApiResponseMessage<CompanyResponse>> => {
    const res = await axiosPrivate.put(`/companies/${id}`, data);
    return res.data;
  },
};