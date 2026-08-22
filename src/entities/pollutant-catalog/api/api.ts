import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  PollutantCatalogListQuery, PollutantCatalogRegisterRequest,
  PollutantCatalogResponse, PollutantCatalogUpdateRequest,
} from './dto';

/** 플랫폼 운영자(PLATFORM_ADMIN) 전용 API. 고객사 범위를 다루지 않는다. */
export const pollutantCatalogApi = {
  getPollutantCatalogs: async (
    query: PollutantCatalogListQuery = {},
  ): Promise<ApiResponseMessage<PollutantCatalogResponse[]>> => {
    const res = await axiosPrivate.get('/platform/pollutant-catalog', { params: query });
    return res.data;
  },

  getPollutantCatalog: async (id: number): Promise<ApiResponseMessage<PollutantCatalogResponse>> => {
    const res = await axiosPrivate.get(`/platform/pollutant-catalog/${id}`);
    return res.data;
  },

  registerPollutantCatalog: async (
    data: PollutantCatalogRegisterRequest,
  ): Promise<ApiResponseMessage<PollutantCatalogResponse>> => {
    const res = await axiosPrivate.post('/platform/pollutant-catalog', data);
    return res.data;
  },

  updatePollutantCatalog: async (
    id: number, data: PollutantCatalogUpdateRequest,
  ): Promise<ApiResponseMessage<PollutantCatalogResponse>> => {
    const res = await axiosPrivate.put(`/platform/pollutant-catalog/${id}`, data);
    return res.data;
  },

  /** 폐지 — 선택 목록에서 감춘다. 이미 쓰고 있는 고객사 데이터는 유지된다. */
  deactivatePollutantCatalog: async (id: number): Promise<ApiResponseMessage<PollutantCatalogResponse>> => {
    const res = await axiosPrivate.patch(`/platform/pollutant-catalog/${id}/deactivate`);
    return res.data;
  },

  activatePollutantCatalog: async (id: number): Promise<ApiResponseMessage<PollutantCatalogResponse>> => {
    const res = await axiosPrivate.patch(`/platform/pollutant-catalog/${id}/activate`);
    return res.data;
  },
}
