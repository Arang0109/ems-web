import { useState, useMemo } from 'react';

import { useEquipments } from '@entities/equipment';
import type { EquipType, InspectionType } from '@shared/model';

import { defaultColumns } from './columns';
import { toEquipmentRows } from './mapper';
import type { EquipmentTableRow } from './types';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

interface Props {
  type: EquipType;
  onSuccess?: () => void;
}

export const useEquipmentTable = ({ type, onSuccess }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  // 검사 이력은 상세 모달의 검사 행에서 열리며, 어느 검사 종류인지가 함께 필요하다.
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [inspectionType, setInspectionType] = useState<InspectionType | null>(null);
  /** 상세 모달 대상 — 상세보기를 누른(또는 클릭한) 행이다. */
  const [detailEquipmentId, setDetailEquipmentId] = useState<string | null>(null);

  const { data, loading, error, refetch: equipmentRefetch } = useEquipments(type);

  const tableData = useMemo(
    () => data?.map(toEquipmentRows),
    [data]
  );

  // Row 는 표시용 포맷 값이라 폼 초기값으로 쓸 수 없다. 목록 원본에서 같은 id 를 찾는다.
  // id 만 보관하고 파생시켜야 검사 이력 등록 등으로 refetch 된 뒤에도 최신 값을 따른다.
  const detailEquipment = useMemo(
    () => data.find((equipment) => equipment.id === detailEquipmentId) ?? null,
    [data, detailEquipmentId],
  );

  const handleViewDetail = (row: EquipmentTableRow) => {
    setDetailEquipmentId(row.id);
    setUpdateModalOpen(true);
  };

  const handleOpenInspectionHistory = (type: InspectionType) => {
    setInspectionType(type);
    setInspectionModalOpen(true);
  };

  const refetch = () => {
    equipmentRefetch();
    onSuccess?.();
  };

  const { table, globalFilter, setGlobalFilter } = useDataTable<EquipmentTableRow>({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.COMPACT,
    onViewDetail: handleViewDetail,
  });

  return {
    table,

    handleRowClick: handleViewDetail,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailEquipment,

    inspectionModalOpen, setInspectionModalOpen,
    inspectionType, handleOpenInspectionHistory,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  };
};
