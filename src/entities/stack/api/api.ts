import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  StackRegisterRequest, StackUpdateRequest, StackListResponse, StackDetailResponse, StackResponse,
  FacilityRegisterRequest, FacilityUpdateRequest, FacilityReorderRequest,
  PreventionRegisterRequest, PreventionUpdateRequest, PreventionReorderRequest,
} from './dto';

export const stackApi = {
  getStack: async (stackId: number): Promise<ApiResponseMessage<StackDetailResponse>> => {
    const res = await axiosPrivate.get(`/stacks/${stackId}`);
    return res.data;
  },

  getStacks: async (workplaceId: number | null = null): Promise<ApiResponseMessage<StackListResponse[]>> => {
    const params = workplaceId != null ? { workplaceId } : {};
    const res = await axiosPrivate.get('/stacks', { params });
    return res.data;
  },

  registerStack: async (data: StackRegisterRequest): Promise<ApiResponseMessage<StackResponse>> => {
    const res = await axiosPrivate.post('/stacks', data);
    return res.data;
  },

  updateStack: async (stackId: number, data: StackUpdateRequest): Promise<ApiResponseMessage<StackResponse>> => {
    const res = await axiosPrivate.put(`/stacks/${stackId}`, data);
    return res.data;
  },

  registerFacility: async (data: FacilityRegisterRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.post(`/facilities`, data);
    return res.data;
  },

  updateFacility: async (facilityId: number, data: FacilityUpdateRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.put(`/facilities/${facilityId}`, data);
    return res.data;
  },

  reorderFacilities: async (data: FacilityReorderRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.put(`/facilities/order`, data);
    return res.data;
  },

  deleteFacility: async (facilityId: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/facilities/${facilityId}`);
    return res.data;
  },

  registerPrevention: async (data: PreventionRegisterRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.post(`/preventions`, data);
    return res.data;
  },

  updatePrevention: async (preventionId: number, data: PreventionUpdateRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.put(`/preventions/${preventionId}`, data);
    return res.data;
  },

  reorderPreventions: async (data: PreventionReorderRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.put(`/preventions/order`, data);
    return res.data;
  },

  deletePrevention: async (preventionId: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/preventions/${preventionId}`);
    return res.data;
  },
}