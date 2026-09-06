import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@entities/auth';
import { useSchedules } from '@entities/schedule';

import { isWithinDateRange, toPresetRange } from '@shared/lib';
import { useDataTable } from '@shared/model';
import { TABLE_PAGE_SIZE } from '@shared/config';

import { defaultColumns } from './columns';
import { toTeamScheduleRows } from './mapper';

/**
 * 대시보드의 "오늘 우리 팀 일정" 표.
 *
 * 서버 목록 API 가 팀·기간 파라미터를 받지 않으므로(tenant 단위 전량 반환) 여기서 좁힌다.
 * 팀 미배정 사용자(관리자·플랫폼 운영자 등)는 팀 조건 없이 전체를 본다.
 */
export const useTeamScheduleTable = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading: loading, error } = useSchedules();

  // 기준일은 마운트 시점에 고정한다 — 렌더마다 new Date() 를 만들면 범위가 흔들린다
  const [today] = useState(() => new Date());
  const todayRange = useMemo(() => toPresetRange('today', today), [today]);

  const teamId = user?.teamId ?? null;

  const tableData = useMemo(
    () =>
      data
        .filter((item) => isWithinDateRange(item.sampledAt, todayRange))
        .filter((item) => teamId === null || item.teamId === teamId)
        .map(toTeamScheduleRows),
    [data, todayRange, teamId],
  );

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
    onViewDetail: (row) => navigate(`/schedule/${row.scheduleId}`),
  });

  return {
    table,

    teamName: user?.teamName ?? null,

    globalFilter, setGlobalFilter,

    isLoading: loading, error,
  };
};
