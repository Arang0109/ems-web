import { useMemo, useState } from "react";

import { useMeasurementMethods } from "@entities/measurement-method";

import { defaultColumns } from "./columns";
import { toMeasurementMethodRow } from "./mapper";
import type { MeasurementMethodTableRow } from "./types";

import { useDataTable } from "@shared/model";
import { TABLE_PAGE_SIZE } from "@shared/config";

export const useMeasurementMethodTable = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  /** 상세 모달 대상 — 상세보기를 누른(또는 클릭한) 행의 측정방법 id */
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data, isLoading, error } = useMeasurementMethods();

  // 서버가 sortOrder 순으로 주므로 배열 순서가 곧 표시 순서다 — 기본 정렬을 걸지 않는다.
  const tableData = useMemo(() => data.map(toMeasurementMethodRow), [data]);

  // Row 는 표시용 포맷 값이라 폼 초기값으로 쓸 수 없다. 목록 원본에서 같은 id 를 찾는다.
  // id 만 보관하고 파생시켜야 목록 캐시가 갱신된 뒤에도 모달이 최신 값을 따른다.
  const detailMethod = useMemo(
    () => data.find((method) => method.id === detailId) ?? null,
    [data, detailId],
  );

  const handleViewDetail = (row: MeasurementMethodTableRow) => {
    setDetailId(row.id);
    setUpdateModalOpen(true);
  };

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.WIDE,
    onViewDetail: handleViewDetail,
    overrides: { getRowId: (row) => String(row.id) },
  });

  return {
    table,
    methodCount: data.length,

    handleRowClick: handleViewDetail,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailId, detailMethod,

    globalFilter, setGlobalFilter,

    isLoading, error,
  };
};
