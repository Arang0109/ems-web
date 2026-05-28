import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  Company, CompanyDetail,
  ContractOverview
} from '../model/company-types';

export const companyApi = {
  getCompanies: async (): Promise<ApiResponseMessage<Company[]>> => {
    const res = await axiosPrivate.get('/companies');
    return res.data;
  },

  getContractOverview: async (): Promise<ApiResponseMessage<ContractOverview>> => {
    const res = await axiosPrivate.get('/companies/contract-summary');
    return res.data;
  },

  getCompanyDetail: async (companyId: number): Promise<ApiResponseMessage<CompanyDetail>> => {
    const res = await axiosPrivate.get(`/companies/${companyId}`);
    return res.data;
  },
};
