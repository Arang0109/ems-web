import type { EquipStatus } from "@shared/model";

export type EquipmentTableRow = {
  id: string;
  managementNumber: string;
  equipmentName: string;
  modelName: string;
  manufacturer: string;
  price: string;          // 포맷된 금액 문자열
  status: EquipStatus;    // 배지 렌더링용 원본 값
};
