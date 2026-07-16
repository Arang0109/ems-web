import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  MemberRegisterRequest,
  MemberResponse,
  MemberUpdateRequest,
  RoleResponse,
} from './dto';

export const memberApi = {
  getMember: async (id: number): Promise<ApiResponseMessage<MemberResponse>> => {
    const res = await axiosPrivate.get(`/admin/members/${id}`);
    return res.data;
  },

  getMemberList: async (): Promise<ApiResponseMessage<MemberResponse[]>> => {
    const res = await axiosPrivate.get('/admin/members');
    return res.data;
  },

  registerMember: async (data: MemberRegisterRequest): Promise<ApiResponseMessage<MemberResponse>> => {
    const res = await axiosPrivate.post('/admin/members', data);
    return res.data;
  },

  updateMember: async (id: number, data: MemberUpdateRequest): Promise<ApiResponseMessage<MemberResponse>> => {
    const res = await axiosPrivate.put(`/admin/members/${id}`, data);
    return res.data;
  },

  deleteMember: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/admin/members/${id}`);
    return res.data;
  },
};

export const roleApi = {
  getRoleList: async (): Promise<ApiResponseMessage<RoleResponse[]>> => {
    const res = await axiosPrivate.get('/roles');
    return res.data;
  },
};
