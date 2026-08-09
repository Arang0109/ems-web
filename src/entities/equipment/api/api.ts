import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage, EquipType } from '@shared/model';
import type {
  CreateEquipmentRequest,
  UpdateEquipmentRequest,
  ChangeEquipmentStatusRequest,
  EquipmentResponse,
  RecordInspectionRequest,
  InspectionRecordResponse,
} from './dto';

export const equipmentApi = {
  getEquipment: async (id: string): Promise<ApiResponseMessage<EquipmentResponse>> => {
    const res = await axiosPrivate.get(`/equipments/${id}`);
    return res.data;
  },

  getEquipments: async (type?: EquipType): Promise<ApiResponseMessage<EquipmentResponse[]>> => {
    const res = await axiosPrivate.get('/equipments', { params: type ? { type } : undefined });
    return res.data;
  },

  registerEquipment: async (data: CreateEquipmentRequest): Promise<ApiResponseMessage<EquipmentResponse>> => {
    const res = await axiosPrivate.post('/equipments', data);
    return res.data;
  },

  updateEquipment: async (id: string, data: UpdateEquipmentRequest): Promise<ApiResponseMessage<EquipmentResponse>> => {
    const res = await axiosPrivate.put(`/equipments/${id}`, data);
    return res.data;
  },

  deleteEquipment: async (id: string): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/equipments/${id}`);
    return res.data;
  },

  changeEquipmentStatus: async (id: string, data: ChangeEquipmentStatusRequest): Promise<ApiResponseMessage<EquipmentResponse>> => {
    const res = await axiosPrivate.patch(`/equipments/${id}/status`, data);
    return res.data;
  },

  getInspectionRecords: async (equipmentId: string): Promise<ApiResponseMessage<InspectionRecordResponse[]>> => {
    const res = await axiosPrivate.get(`/equipments/${equipmentId}/inspections`);
    return res.data;
  },

  recordInspection: async (equipmentId: string, data: RecordInspectionRequest): Promise<ApiResponseMessage<InspectionRecordResponse>> => {
    const res = await axiosPrivate.post(`/equipments/${equipmentId}/inspections`, data);
    return res.data;
  },
};
