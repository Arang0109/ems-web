import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  CreateScheduleRequest, ScheduleListResponse, ScheduleResponse, SaveSheetsRequest,
} from './dto';

export const scheduleApi = {
  getSchedules: async (): Promise<ApiResponseMessage<ScheduleListResponse[]>> => {
    const res = await axiosPrivate.get('/schedules');
    return res.data;
  },

  getSchedule: async (id: number): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.get(`/schedules/${id}`);
    return res.data;
  },

  registerSchedule: async (data: CreateScheduleRequest): Promise<ApiResponseMessage<ScheduleListResponse>> => {
    const res = await axiosPrivate.post('/schedules', data);
    return res.data;
  },

  saveSheets: async (id: number, body: SaveSheetsRequest): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.put(`/schedules/${id}/sheets`, body);
    return res.data;
  },
};
