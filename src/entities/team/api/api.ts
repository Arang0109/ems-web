import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { TeamRegisterRequest, TeamResponse, TeamUpdateRequest } from './dto';

export const teamApi = {
  getTeam: async (id: number): Promise<ApiResponseMessage<TeamResponse>> => {
    const res = await axiosPrivate.get(`/teams/${id}`);
    return res.data;
  },

  getTeamList: async (): Promise<ApiResponseMessage<TeamResponse[]>> => {
    const res = await axiosPrivate.get('/teams');
    return res.data;
  },

  registerTeam: async (data: TeamRegisterRequest): Promise<ApiResponseMessage<TeamResponse>> => {
    const res = await axiosPrivate.post('/teams', data);
    return res.data;
  },

  updateTeam: async (id: number, data: TeamUpdateRequest): Promise<ApiResponseMessage<TeamResponse>> => {
    const res = await axiosPrivate.put(`/teams/${id}`, data);
    return res.data;
  },

  deleteTeam: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/teams/${id}`);
    return res.data;
  },
};
