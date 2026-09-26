import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  CustomFieldDefinitionRegisterRequest, CustomFieldDefinitionResponse, CustomFieldDefinitionUpdateRequest,
} from './dto';

/**
 * 경로가 `/schedules/custom-fields` 인 것은 측정계획의 하위 설정이기 때문이다(`/schedules/canceled` 와 같은 결).
 * 목록은 인증 사용자 전부가 읽고(회차 값 입력 폼이 라벨을 그려야 한다), 쓰기 3경로는 ADMIN 만 허용된다.
 */
export const scheduleCustomFieldApi = {
  /** 이 고객사의 커스텀 필드 정의 전부. 표시 순서(`sortOrder`)대로 온다. */
  getCustomFields: async (): Promise<ApiResponseMessage<CustomFieldDefinitionResponse[]>> => {
    const res = await axiosPrivate.get('/schedules/custom-fields');
    return res.data;
  },

  registerCustomField: async (
    data: CustomFieldDefinitionRegisterRequest,
  ): Promise<ApiResponseMessage<CustomFieldDefinitionResponse>> => {
    const res = await axiosPrivate.post('/schedules/custom-fields', data);
    return res.data;
  },

  updateCustomField: async (
    id: number,
    data: CustomFieldDefinitionUpdateRequest,
  ): Promise<ApiResponseMessage<CustomFieldDefinitionResponse>> => {
    const res = await axiosPrivate.put(`/schedules/custom-fields/${id}`, data);
    return res.data;
  },

  /** 정의만 지운다. 회차에 저장된 값은 남아 있어 템플릿이 그 키를 참조하면 계속 출력된다. */
  deleteCustomField: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/schedules/custom-fields/${id}`);
    return res.data;
  },
};
