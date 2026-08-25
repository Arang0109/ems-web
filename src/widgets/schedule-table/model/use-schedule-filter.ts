import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { useAuth } from "@entities/auth";

import {
  isSameDateRange,
  matchDateRangePreset,
  toPresetRange,
  type DateRangePreset,
  type DateRangeValue,
} from "@shared/lib";
import type { DateRange } from "@shared/ui/form";

import {
  ALL_STATUSES,
  ALL_TEAMS,
  readFilterParams,
  writeFilterParams,
  type ScheduleFilterValues,
} from "./filter-params";

export { ALL_TEAMS, ALL_STATUSES } from "./filter-params";

/** 기본 조회 범위 — 오늘 하루 */
const DEFAULT_PRESET: DateRangePreset = "today";

/** 선택 도중이라 `to` 가 빈 구간을 확정 구간으로 좁힌다. `from` 조차 없으면 기본값을 쓴다. */
const toRangeValue = (range: DateRange, fallback: DateRangeValue): DateRangeValue =>
  range.from ? { from: range.from, to: range.to ?? range.from } : fallback;

/**
 * 측정계획 목록의 조회 조건.
 *
 * 조건의 주인은 **URL 쿼리**다 — 상세로 들어갔다 돌아오거나 새로고침해도 보던 목록이
 * 그대로 남아야 하기 때문이다. 기간은 팝오버 안에서 편집하다 "적용"을 눌러야 반영되므로
 * 편집값(`draftRange`)만 로컬 상태로 두고, 팀·상태는 칩이라 고르는 즉시 URL 에 실린다.
 */
export const useScheduleFilter = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // 기준일은 마운트 시점에 고정한다 — 렌더마다 new Date() 를 만들면 프리셋 일치 판정이 흔들린다
  const [today] = useState(() => new Date());
  const defaultRange = useMemo(() => toPresetRange(DEFAULT_PRESET, today), [today]);
  // 기본 팀은 로그인 사용자의 소속 팀. 팀 미배정이면 기존대로 전체 팀을 본다.
  const defaultTeamId = user?.teamId != null ? String(user.teamId) : ALL_TEAMS;

  const defaults = useMemo(
    () => ({ range: defaultRange, teamId: defaultTeamId }),
    [defaultRange, defaultTeamId],
  );

  // 반드시 메모해야 한다 — 매 렌더 새 Date 쌍을 만들면 목록 필터링이 통째로 다시 돈다
  const values = useMemo(
    () => readFilterParams(searchParams, defaults),
    [searchParams, defaults],
  );

  const [draftRange, setDraftRange] = useState<DateRange>(() => values.range);

  const draftValue = toRangeValue(draftRange, defaultRange);

  /**
   * 조건을 URL 에 싣는다.
   *
   * - `replace` — 필터 조작이 히스토리에 쌓이면 상세에서 뒤로가기 한 번에 목록으로 못 돌아온다.
   * - 한 액션에서 **한 번만** 부른다. `setSearchParams` 는 현재 렌더의 쿼리를 기준으로
   *   다음 쿼리를 만들기 때문에, 두 번 부르면 앞의 변경이 사라진다.
   */
  const update = (patch: Partial<ScheduleFilterValues>) => {
    const next = writeFilterParams(searchParams, { ...values, ...patch }, defaults);
    if (next.toString() === searchParams.toString()) return;

    setSearchParams(next, { replace: true });
  };

  // 조건이 바뀌면 첫 페이지로 돌아간다 — 결과가 줄었을 때 빈 페이지에 남지 않도록
  const changeTeam = (value: string | null) =>
    update({ teamId: value ?? ALL_TEAMS, pageIndex: 0 });

  const changeStatus = (value: string | null) =>
    update({ status: value ?? ALL_STATUSES, pageIndex: 0 });

  const apply = () => update({ range: draftValue, pageIndex: 0 });

  const changePage = (pageIndex: number) => update({ pageIndex });

  /** 검색어처럼 URL 밖의 조건이 바뀔 때 쓰는 페이지 되돌리기. 이미 첫 페이지면 아무것도 하지 않는다 */
  const resetPage = () => {
    if (values.pageIndex !== 0) update({ pageIndex: 0 });
  };

  const selectPreset = (preset: DateRangePreset) => setDraftRange(toPresetRange(preset, today));

  const changeDraftRange = (range: DateRange | undefined) => setDraftRange(range ?? defaultRange);

  const reset = () => setDraftRange(defaultRange);

  /** 팝오버를 열 때 편집하다 만 값을 적용값으로 되돌린다 */
  const syncDraft = () => setDraftRange(values.range);

  return {
    appliedRange: values.range,
    teamId: values.teamId,
    changeTeam,
    status: values.status,
    changeStatus,

    pageIndex: values.pageIndex,
    changePage,
    resetPage,

    draftRange,
    draftPreset: matchDateRangePreset(draftValue, today),
    selectPreset,
    changeDraftRange,

    apply,
    reset,
    syncDraft,

    /** 팝오버가 담당하는 조건 중 기본값과 달라진 개수 — 트리거 배지에 쓴다 */
    activeFilterCount: isSameDateRange(values.range, defaultRange) ? 0 : 1,
  };
};
