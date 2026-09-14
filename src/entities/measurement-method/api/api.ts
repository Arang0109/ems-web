import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  MeasurementMethodRegisterRequest, MeasurementMethodResponse, MeasurementMethodUpdateRequest,
} from './dto';

export const measurementMethodApi = {
  /** 이 고객사의 측정방법 전부. 표시 순서(`sortOrder`)대로 온다. */
  getMeasurementMethods: async (): Promise<ApiResponseMessage<MeasurementMethodResponse[]>> => {
    const res = await axiosPrivate.get('/measurement-methods');
    return res.data;
  },

  getMeasurementMethod: async (id: number): Promise<ApiResponseMessage<MeasurementMethodResponse>> => {
    const res = await axiosPrivate.get(`/measurement-methods/${id}`);
    return res.data;
  },

  registerMeasurementMethod: async (
    data: MeasurementMethodRegisterRequest,
  ): Promise<ApiResponseMessage<MeasurementMethodResponse>> => {
    const res = await axiosPrivate.post('/measurement-methods', data);
    return res.data;
  },

  /**
   * 기본 8종을 이름 기준으로 멱등하게 채운다. 같은 이름이 있으면 손대지 않으므로 여러 번 불러도
   * 안전하다. 채운 뒤의 전체 목록을 돌려준다.
   */
  ensureDefaultMeasurementMethods: async (): Promise<ApiResponseMessage<MeasurementMethodResponse[]>> => {
    const res = await axiosPrivate.post('/measurement-methods/defaults');
    return res.data;
  },

  updateMeasurementMethod: async (
    id: number,
    data: MeasurementMethodUpdateRequest,
  ): Promise<ApiResponseMessage<MeasurementMethodResponse>> => {
    const res = await axiosPrivate.put(`/measurement-methods/${id}`, data);
    return res.data;
  },

  /** 측정물질이 쓰고 있으면 서버가 409 로 거부한다. */
  deleteMeasurementMethod: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/measurement-methods/${id}`);
    return res.data;
  },
};
