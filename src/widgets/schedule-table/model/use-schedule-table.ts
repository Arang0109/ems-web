import { useEffect, useMemo, type Dispatch, type SetStateAction } from 'react';

import { useSchedules } from '@entities/schedule';
import { useTeams } from '@entities/team';

import { isWithinDateRange } from '@shared/lib';
import { useDataTable, scheduleStatusOptions } from '@shared/model';
import { TABLE_PAGE_SIZE } from "@shared/config";

import { defaultColumns } from './columns';
import { toScheduleRows } from './mapper';
import { ALL_STATUSES, ALL_TEAMS } from './filter-params';
import { useScheduleFilter } from './use-schedule-filter';

// 취소된 계획은 이 목록에 오지 않으므로(전용 화면에서 관리) 필터 선택지에서도 뺀다.
const statusOptions = [
  { value: ALL_STATUSES, label: '전체 상태' },
  ...scheduleStatusOptions.filter((option) => option.value !== 'CANCELED'),
];

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
    // 페이지도 URL 이 소유한다 — 상세에서 돌아왔을 때 보던 페이지가 남아야 한다
    pageIndex: filter.pageIndex,
    onPageIndexChange: filter.changePage,
  });

  // 오래된 링크나 자리를 비운 사이 줄어든 목록 때문에 범위 밖 페이지에 설 수 있다.
  // 로딩이 끝나 실제 페이지 수를 안 뒤에만 마지막 페이지로 끌어당긴다 (교정 후 조건이 꺼져 한 번만 돈다).
  const pageCount = table.getPageCount();
  const isPageOutOfRange = !loading && !error && pageCount > 0 && filter.pageIndex > pageCount - 1;

  useEffect(() => {
    if (isPageOutOfRange) filter.changePage(pageCount - 1);
    // filter.changePage 는 매 렌더 새 함수라 의존성에 넣으면 매번 다시 돈다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageOutOfRange, pageCount]);

  // 검색어는 URL 에 싣지 않지만, 결과가 줄어드는 것은 같으므로 첫 페이지로 되돌린다.
  // (페이지 자동 리셋은 URL 복원을 깨뜨려 꺼 두었다 — `useDataTable` 참조)
  const changeGlobalFilter: Dispatch<SetStateAction<string>> = (value) => {
    setGlobalFilter(value);
    filter.resetPage();
  };

  return {
    table,

    globalFilter, setGlobalFilter: changeGlobalFilter,

    teamOptions,
    statusOptions,
    filter,

    loading, error,
  };
};
