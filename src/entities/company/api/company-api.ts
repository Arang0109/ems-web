import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { Company, WorkplaceTableCols } from '../model/company-types';

export const companyApi = {
  getCompanies: async (): Promise<ApiResponseMessage<Company[]>> => {
    const res = await axiosPrivate.get('/companies'); //
    return res.data;
  },

  getCompanyWorkplaces: async (companyId: number): Promise<ApiResponseMessage<WorkplaceTableCols[]>> => {
    const res = await axiosPrivate.get(`/companies/${companyId}/workplaces`);
    return res.data;
  }
};