import type {
  CreateEquipmentRequest,
  UpdateEquipmentRequest,
  ChangeEquipmentStatusRequest,
} from "./dto";
import type {
  EquipmentCreate,
  EquipmentUpdate,
  EquipmentStatusChange,
} from "../model/types";

import { trimValue } from "@shared/lib";

// Domain(number) → DTO(number): 숫자·spec은 재변환 없이 passthrough, 문자열만 정규화한다.
const toRequestBody = (vo: EquipmentCreate): CreateEquipmentRequest => ({
  type: vo.type,
  managementNumber: trimValue(vo.managementNumber),
  serialNumber: trimValue(vo.serialNumber),
  modelName: trimValue(vo.modelName),
  equipmentName: trimValue(vo.equipmentName),
  alias: trimValue(vo.alias),
  price: vo.price,
  manufacturer: trimValue(vo.manufacturer),
  originCountry: trimValue(vo.originCountry),
  purchaseDate: vo.purchaseDate,
  remark: trimValue(vo.remark),
  calibrationCycle: vo.calibrationCycle,
  spec: vo.spec,
});

export const toRegisterRequest = (vo: EquipmentCreate): CreateEquipmentRequest =>
  toRequestBody(vo);

export const toUpdateRequest = (vo: EquipmentUpdate): UpdateEquipmentRequest =>
  toRequestBody(vo);

export const toStatusChangeRequest = (vo: EquipmentStatusChange): ChangeEquipmentStatusRequest => ({
  status: vo.status,
});
