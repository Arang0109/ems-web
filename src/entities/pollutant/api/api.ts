import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  PollutantCandidateResponse, PollutantListQuery, PollutantRegisterRequest,
  PollutantResponse, PollutantUpdateRequest,
} from './dto';

export const pollutantApi = {
  /** 이 고객사가 채택해 관리 중인 측정물질 목록. 가이드에만 있는 항목은 포함되지 않는다. */
  getPollutants: async (query: PollutantListQuery = {}): Promise<ApiResponseMessage<PollutantResponse[]>> => {
    const res = await axiosPrivate.get('/pollutants', { params: query });
    return res.data;
  },

  /** 아직 채택하지 않은 가이드 항목 — 등록 화면의 선택 후보다. */
  getPollutantCandidates: async (
    query: PollutantListQuery = {},
  ): Promise<ApiResponseMessage<PollutantCandidateResponse[]>> => {
    const res = await axiosPrivate.get('/pollutants/candidates', { params: query });
    return res.data;
  },

  getPollutant: async (id: number): Promise<ApiResponseMessage<PollutantResponse>> => {
    const res = await axiosPrivate.get(`/pollutants/${id}`);
    return res.data;
  },

  registerPollutant: async (data: PollutantRegisterRequest): Promise<ApiResponseMessage<PollutantResponse>> => {
    const res = await axiosPrivate.post('/pollutants', data);
    return res.data;
  },

  updatePollutant: async (id: number, data: PollutantUpdateRequest): Promise<ApiResponseMessage<PollutantResponse>> => {
    const res = await axiosPrivate.put(`/pollutants/${id}`, data);
    return res.data;
  },

  deletePollutant: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/pollutants/${id}`);
    return res.data;
  },
}
