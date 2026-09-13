import { useState, useMemo } from 'react';

import { usePollutantCatalogs } from '@entities/pollutant-catalog';

import { defaultColumns } from './columns';
import { toPollutantCatalogRow } from './mapper';
import type { PollutantCatalogTableRow } from './types';

import { useDataTable, measurementFieldOptions } from '@shared/model';
import type { MeasurementField } from '@shared/model';

import { TABLE_PAGE_SIZE } from '@shared/config';

/** 측정분야 필터의 "전체" 값. Select 는 빈 문자열을 미선택으로 보므로 실제 값을 준다. */
const ALL_FIELDS = 'ALL';

const fieldOptions = [{ value: ALL_FIELDS, label: '전체 분야' }, ...measurementFieldOptions];

export const usePollutantCatalogTable = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [detailCatalogId, setDetailCatalogId] = useState<number | null>(null);
  const [field, setField] = useState<string>(ALL_FIELDS);

  // 운영 화면에서는 폐지된 항목도 보여야 한다 — 폐지 해제가 여기서만 가능하기 때문이다.
  const { data, isLoading: loading, error } = usePollutantCatalogs({
    field: field === ALL_FIELDS ? undefined : (field as MeasurementField),
    includeInactive: true,
  });

  const tableData = useMemo(() => data.map(toPollutantCatalogRow), [data]);

  // Row 는 표시용 포맷 값이라 폼 초기값으로 쓸 수 없다. 목록 원본에서 같은 id 를 찾는다.
  // id 만 보관하고 파생시켜야 목록 캐시가 갱신된 뒤에도 모달이 최신 값을 따른다.
  const detailCatalog = useMemo(
    () => data.find((catalog) => catalog.id === detailCatalogId) ?? null,
    [data, detailCatalogId],
  );

;

  const handleViewDetail = (row: PollutantCatalogTableRow) => {
    setDetailCatalogId(row.id);
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

    handleRowClick: handleViewDetail,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailCatalog,

    globalFilter, setGlobalFilter,
    field, setField, fieldOptions,


    isLoading: loading, error,
  };
};
