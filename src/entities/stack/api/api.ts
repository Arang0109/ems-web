import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  StackRegisterRequest, StackUpdateRequest, StackListResponse, StackDetailResponse, StackResponse,
  FacilityRegisterRequest, FacilityUpdateRequest,
  PreventionRegisterRequest, PreventionUpdateRequest,
  TargetSubstanceRegisterRequest,
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

  registerFacility: async (stackId: number, data: FacilityRegisterRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.post(`/stacks/${stackId}/facilities`, data);
    return res.data;
  },

  updateStack: async (id: number, data: StackUpdateRequest): Promise<ApiResponseMessage<StackResponse>> => {
    const res = await axiosPrivate.put(`/stacks/${id}`, data);
    return res.data;
  },

  updateFacility: async (stackId: number, facilityId: number, data: FacilityUpdateRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.put(`/stacks/${stackId}/facilities/${facilityId}`, data);
    return res.data;
  },

  deleteFacility: async (stackId: number, facilityId: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/stacks/${stackId}/facilities/${facilityId}`);
    return res.data;
  },

  registerPrevention: async (stackId: number, data: PreventionRegisterRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.post(`/stacks/${stackId}/preventions`, data);
    return res.data;
  },

  updatePrevention: async (stackId: number, preventionId: number, data: PreventionUpdateRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.put(`/stacks/${stackId}/preventions/${preventionId}`, data);
    return res.data;
  },

  deletePrevention: async (stackId: number, preventionId: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/stacks/${stackId}/preventions/${preventionId}`);
    return res.data;
  },

  registerSubstance: async (stackId: number, preventionId: number, data: TargetSubstanceRegisterRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.post(`/stacks/${stackId}/preventions/${preventionId}/substances`, data);
    return res.data;
  },

  deleteSubstance: async (stackId: number, preventionId: number, substanceId: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/stacks/${stackId}/preventions/${preventionId}/substances/${substanceId}`);
    return res.data;
  },
}