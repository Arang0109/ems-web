import type { AxiosResponse } from 'axios';

import { axiosPrivate, unwrap } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type {
  CreateScheduleRequest, ScheduleListResponse, ScheduleResponse, SaveSheetsRequest,
  ChangeScheduleEquipmentsRequest, ChangeClientSnapshotRequest, ChangeScheduleItemsRequest,
  ReorderScheduleItemsRequest, UpdateScheduleItemRequest,
  ChangeTenantSnapshotRequest, ChangeTeamSnapshotRequest,
  UpdateReportDatesRequest, UpdateScheduleRequest,
  PreviousSheetResponse, PreviousSheetCandidateResponse,
  AnalysisResultResponse, SaveSamplingTimesRequest, SaveAnalysisResultsRequest,
} from './dto';
import type { MeasurementCategory } from '@shared/model';

export const scheduleApi = {
  // 취소된 계획은 담기지 않는다 — getCanceledSchedules 로 조회한다.
  getSchedules: async (): Promise<ApiResponseMessage<ScheduleListResponse[]>> => {
    const res = await axiosPrivate.get('/schedules');
    return res.data;
  },

  getCanceledSchedules: async (): Promise<ApiResponseMessage<ScheduleListResponse[]>> => {
    const res = await axiosPrivate.get('/schedules/canceled');
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

  // 동시 편집 충돌(409)을 다른 실패와 구분해야 하므로 unwrap 을 거쳐 ApiError 로 던진다.
  saveSheets: async (id: number, body: SaveSheetsRequest): Promise<ScheduleResponse> => {
    const res = await axiosPrivate.put<ApiResponseMessage<ScheduleResponse>>(`/schedules/${id}/sheets`, body);
    return unwrap(res);
  },

  // 불러올 기록이 없으면 data 가 null 로 온다 — 오류가 아니므로 그대로 흘려보낸다.
  // sourceScheduleId 를 생략하면 가장 최근 회차를 준다.
  getPreviousSheet: async (
    id: number, category: MeasurementCategory, sourceScheduleId?: number,
  ): Promise<ApiResponseMessage<PreviousSheetResponse | null>> => {
    const res = await axiosPrivate.get(`/schedules/${id}/sheets/${category}/previous`, {
      params: sourceScheduleId == null ? undefined : { sourceScheduleId },
    });
    return res.data;
  },

  getPreviousSheetCandidates: async (
    id: number, category: MeasurementCategory,
  ): Promise<ApiResponseMessage<PreviousSheetCandidateResponse[]>> => {
    const res = await axiosPrivate.get(`/schedules/${id}/sheets/${category}/previous/candidates`);
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

  changeItems: async (
    id: number, body: ChangeScheduleItemsRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.patch(`/schedules/${id}/items`, body);
    return res.data;
  },

  // 성적서에 실릴 측정항목의 순서를 바꾼다. 항목 집합은 그대로 두고 배열 순서만 재배치하므로,
  // 항목을 더하거나 빼는 changeItems 와 경로가 분리돼 있다.
  reorderItems: async (
    id: number, body: ReorderScheduleItemsRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.put(`/schedules/${id}/items/order`, body);
    return res.data;
  },

  // 이 회차 문서의 측정항목 하나만 정정한다. 측정시설 원장은 바뀌지 않으므로,
  // 원장까지 고쳐야 하면 stackPollutantApi.updateStackPollutant 를 따로 호출한다.
  updateItem: async (
    id: number, pollutantId: number, body: UpdateScheduleItemRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.patch(`/schedules/${id}/items/${pollutantId}`, body);
    return res.data;
  },

  // 성적서 진행 일자(접수·분석완료·발행)를 고친다. 실험·분석 탭이 단독으로 소유하는 경로라
  // 전달한 값을 그대로 채택한다 — 빈 값은 지운다. 순서를 어기면 400으로 거부된다.
  updateReportDates: async (
    id: number, body: UpdateReportDatesRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.patch(`/schedules/${id}/report-dates`, body);
    return res.data;
  },

  // 성적서 서명란 담당자(시료분석검사자·기술책임자)를 고친다. 두 탭이 공유하는 경로라 부분 갱신이며,
  // 고객사 원장은 바뀌지 않는다.
  changeTenant: async (
    id: number, body: ChangeTenantSnapshotRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.patch(`/schedules/${id}/tenant`, body);
    return res.data;
  },

  // 이 회차 측정자 표기명을 고친다. 팀 원장과 배정 장비는 바뀌지 않는다.
  changeTeam: async (
    id: number, body: ChangeTeamSnapshotRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.patch(`/schedules/${id}/team`, body);
    return res.data;
  },

  // 계획 정의(채취일자·측정용도·관리번호)를 고친다. 측정분야는 생성 시점에만 정한다.
  // saveSheets 와 달리 동시 편집 충돌을 구분할 필요가 없어 일반 에러 계약을 쓴다.
  updateSchedule: async (
    id: number, body: UpdateScheduleRequest,
  ): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.put(`/schedules/${id}`, body);
    return res.data;
  },

  // ── 생애주기 ──────────────────────────────────────────────
  // 완료와 취소는 의미도, 필수 입력도, 되돌리기 가능성도 달라 엔드포인트가 분리돼 있다.

  completeSchedule: async (id: number): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.post(`/schedules/${id}/completion`);
    return res.data;
  },

  cancelSchedule: async (id: number): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.post(`/schedules/${id}/cancellation`);
    return res.data;
  },

  // 잘못 등록된 계획을 지운다(물리 삭제). 서버가 '측정예정'·'취소'만 허용하며 복구할 수 없다.
  deleteSchedule: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/schedules/${id}`);
    return res.data;
  },

  reopenSchedule: async (id: number): Promise<ApiResponseMessage<ScheduleResponse>> => {
    const res = await axiosPrivate.post(`/schedules/${id}/reopen`);
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

  // ── 실험분석정보 ──────────────────────────────────────────
  // 측정계획 문서의 측정항목 안에 저장되므로 등록·삭제 경로가 없다 — 항목이 곧 행이고,
  // 행을 더하고 빼는 일은 changeItems 가 맡는다. 저장은 소유가 갈린 두 경로뿐이다.

  getAnalyses: async (scheduleId: number): Promise<ApiResponseMessage<AnalysisResultResponse[]>> => {
    const res = await axiosPrivate.get(`/schedules/${scheduleId}/analyses`);
    return res.data;
  },

  saveAnalysisResults: async (
    scheduleId: number, body: SaveAnalysisResultsRequest,
  ): Promise<ApiResponseMessage<AnalysisResultResponse[]>> => {
    const res = await axiosPrivate.put(`/schedules/${scheduleId}/analyses/results`, body);
    return res.data;
  },

  saveSamplingTimes: async (
    scheduleId: number, body: SaveSamplingTimesRequest,
  ): Promise<ApiResponseMessage<AnalysisResultResponse[]>> => {
    const res = await axiosPrivate.put(`/schedules/${scheduleId}/analyses/sampling-times`, body);
    return res.data;
  },
};
