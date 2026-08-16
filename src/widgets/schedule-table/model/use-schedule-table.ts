import { useMemo } from 'react';

import { useSchedules } from '@entities/schedule';
import { useTeams } from '@entities/team';

import { isWithinDateRange } from '@shared/lib';
import { useDataTable, scheduleStatusOptions } from '@shared/model';
import { TABLE_PAGE_SIZE } from "@shared/config";

import { defaultColumns } from './columns';
import { toScheduleRows } from './mapper';
import { ALL_STATUSES, ALL_TEAMS, useScheduleFilter } from './use-schedule-filter';

const statusOptions = [{ value: ALL_STATUSES, label: '전체 상태' }, ...scheduleStatusOptions];

export const useScheduleTable = () => {
  const filter = useScheduleFilter();

  const { data, loading, error } = useSchedules();
  const { data: teams } = useTeams();

  const teamOptions = useMemo(
    () => [
      { value: ALL_TEAMS, label: '전체 팀' },
      ...teams.map((team) => ({ value: String(team.id), label: team.name })),
    ],
    [teams],
  );

  // 서버 목록 API 가 아직 기간·팀·상태 파라미터를 받지 않으므로 여기서 좁힌다.
  // (서버가 쿼리 파라미터를 지원하면 이 필터는 `useSchedules(query)` 로 옮긴다)
  const tableData = useMemo(
    () =>
      data
        .filter((item) => isWithinDateRange(item.sampledAt, filter.appliedRange))
        .filter((item) => filter.teamId === ALL_TEAMS || String(item.teamId) === filter.teamId)
        .filter((item) => filter.status === ALL_STATUSES || item.status === filter.status)
        .map(toScheduleRows),
    [data, filter.appliedRange, filter.teamId, filter.status],
  );

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
  });

  return {
    table,

    globalFilter, setGlobalFilter,

    teamOptions,
    statusOptions,
    filter,

    loading, error,
  };
};
