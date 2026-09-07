import { useState, useMemo } from 'react';

import { usePollutants } from '@entities/pollutant';

import { defaultColumns } from '../model/columns';
import { toPollutantRow } from '../model/mapper';
import type { PollutantTableRow } from '../model/types';

import { useDataTable, measurementFieldOptions } from '@shared/model';
import type { MeasurementField } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

/** 측정분야 필터의 "전체" 값. Select 는 빈 문자열을 미선택으로 보므로 실제 값을 준다. */
const ALL_FIELDS = 'ALL';

const fieldOptions = [{ value: ALL_FIELDS, label: '전체 분야' }, ...measurementFieldOptions];

export const usePollutantTable = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  /** 상세 모달 대상 — 상세보기를 누른(또는 클릭한) 행의 측정물질 id */
  const [detailId, setDetailId] = useState<number | null>(null);
  const [field, setField] = useState<string>(ALL_FIELDS);

  // 채택한 물질만 오므로 목록이 길지 않지만, 분야 필터는 서버가 지원하니 조회 단계에서 좁힌다.
  const { data, isLoading: loading, error } = usePollutants({
    field: field === ALL_FIELDS ? undefined : (field as MeasurementField),
  });

  const tableData = useMemo(() => data.map(toPollutantRow), [data]);

  // Row 는 표시용 포맷 값이라 폼 초기값으로 쓸 수 없다. 목록 원본에서 같은 id 를 찾는다.
  // id 만 보관하고 파생시켜야 목록 캐시가 갱신된 뒤에도 모달이 최신 값을 따른다.
  const detailPollutant = useMemo(
    () => data.find((pollutant) => pollutant.id === detailId) ?? null,
    [data, detailId],
  );

;

  const handleViewDetail = (row: PollutantTableRow) => {
    setDetailId(row.id);
    setUpdateModalOpen(true);
  };

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
    onViewDetail: handleViewDetail,
    // 행 식별을 인덱스가 아닌 측정물질 id 로 고정한다 — 필터·정렬로 순서가 바뀌어도 행이 섞이지 않는다
    overrides: { getRowId: (row) => String(row.id) },
  });

  return {
    table,

    handleRowClick: handleViewDetail,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailId, detailPollutant,

    globalFilter, setGlobalFilter,
    field, setField, fieldOptions,


    isLoading: loading, error,
  };
};
