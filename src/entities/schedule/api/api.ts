import type { AxiosResponse } from 'axios';

import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  CreateScheduleRequest, ScheduleListResponse, ScheduleResponse, SaveSheetsRequest,
  ChangeScheduleEquipmentsRequest, ChangeClientSnapshotRequest, UpdateBasicInfoRequest,
  ChangeScheduleStatusRequest,
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

  changeEquipments: async (
    id: number, body: ChangeScheduleEquipmentsRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.patch(`/schedules/${id}/equipments`, body);
    return res.data;
  },

  changeClient: async (
    id: number, body: ChangeClientSnapshotRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.patch(`/schedules/${id}/client`, body);
    return res.data;
  },

  updateBasicInfo: async (
    id: number, body: UpdateBasicInfoRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.patch(`/schedules/${id}/basic-info`, body);
    return res.data;
  },

  changeStatus: async (
    id: number, body: ChangeScheduleStatusRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.patch(`/schedules/${id}/status`, body);
    return res.data;
  },

  deleteSchedule: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/schedules/${id}`);
    return res.data;
  },

  // 채취기록지 ZIP 내려받기. 다른 API와 달리 ApiResponseMessage(JSON) 래핑이 아니라 바이너리를 반환하고,
  // 파일명이 Content-Disposition 헤더에 담겨 오므로 res.data가 아닌 응답 객체 전체를 넘긴다.
  exportSamplingRecords: async (id: number, template: File): Promise<AxiosResponse<Blob>> => {
    // 서버 계약상 파트는 'template' 하나뿐이다.
    const formData = new FormData();
    formData.append('template', template);

    // Content-Type을 직접 지정하면 multipart boundary가 빠져 서버가 파트를 파싱하지 못하므로 헤더는 건드리지 않는다.
    // validateStatus도 건드리지 않는다 — 인터셉터를 우회하면 401 자동 refresh가 동작하지 않는다.
    return axiosPrivate.post(`/schedules/${id}/sampling-records/export`, formData, {
      responseType: 'blob',
    });
  },
};
