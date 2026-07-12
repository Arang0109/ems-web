import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { ClientRegisterRequest, ClientResponse, ClientUpdateRequest } from './dto';

export const clientApi = {
  getClient: async (id: number): Promise<ApiResponseMessage<ClientResponse>> => {
    const res = await axiosPrivate.get(`/clients/${id}`);
    return res.data;
  },

  getClientList: async (): Promise<ApiResponseMessage<ClientResponse[]>> => {
    const res = await axiosPrivate.get('/clients');
    return res.data;
  },
  
  registerClient: async (data: ClientRegisterRequest): Promise<ApiResponseMessage<ClientResponse>> => {
    const res = await axiosPrivate.post('/clients', data);
    return res.data;
  },

  deleteClient: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/clients/${id}`);
    return res.data;
  },

  updateClient: async (id: number, data: ClientUpdateRequest): Promise<ApiResponseMessage<ClientResponse>> => {
    const res = await axiosPrivate.put(`/clients/${id}`, data);
    return res.data;
  },
};