import { useState, useMemo } from 'react';

import { useMembers } from '@entities/member';

import { defaultColumns } from '../model/columns';
import { toMemberRows } from '../model/mapper';
import type { MemberTableRow } from '../model/types';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

export const useMemberTable = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  /** 상세 모달 대상 — 상세보기를 누른(또는 클릭한) 행이다. */
  const [detailMemberId, setDetailMemberId] = useState<number | null>(null);

  const { data, isLoading: loading, error } = useMembers();

  const tableData = useMemo(
    () => data.map(toMemberRows),
    [data]
  );

  // Row 는 표시용 포맷 값이라 폼 초기값으로 쓸 수 없다. 목록 원본에서 같은 id 를 찾는다.
  // id 만 보관하고 파생시켜야 목록 캐시가 갱신된 뒤에도 모달이 최신 값을 따른다.
  const detailMember = useMemo(
    () => data.find((member) => member.id === detailMemberId) ?? null,
    [data, detailMemberId],
  );


  const handleViewDetail = (row: MemberTableRow) => {
    setDetailMemberId(row.id);
    setUpdateModalOpen(true);
  };

  const { table, globalFilter, setGlobalFilter } = useDataTable<MemberTableRow>({
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
    detailMember,

    globalFilter, setGlobalFilter,

    isLoading: loading, error,
  }
}
