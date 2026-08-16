import { useMemo, useState } from "react";

import { useAuth } from "@entities/auth";

import {
  isSameDateRange,
  matchDateRangePreset,
  toPresetRange,
  type DateRangePreset,
  type DateRangeValue,
} from "@shared/lib";
import type { DateRange } from "@shared/ui/form";

/** 기본 조회 범위 — 오늘 하루 */
const DEFAULT_PRESET: DateRangePreset = "month";

/** 팀 필터의 "전체" 선택값 */
export const ALL_TEAMS = "all";

/** 상태 필터의 "전체" 선택값 */
export const ALL_STATUSES = "all";

/** 선택 도중이라 `to` 가 빈 구간을 확정 구간으로 좁힌다. `from` 조차 없으면 기본값을 쓴다. */
const toRangeValue = (range: DateRange, fallback: DateRangeValue): DateRangeValue =>
  range.from ? { from: range.from, to: range.to ?? range.from } : fallback;

/**
 * 측정계획 목록의 조회 조건.
 *
 * 기간은 팝오버 안에서 편집하다 "적용"을 눌러야 목록에 반영되므로 편집값(`draftRange`)과
 * 적용값(`appliedRange`)을 나눈다. 팀·상태는 필터 바의 칩이라 고르는 즉시 반영한다.
 */
export const useScheduleFilter = () => {
  const { user } = useAuth();

  // 기준일은 마운트 시점에 고정한다 — 렌더마다 new Date() 를 만들면 프리셋 일치 판정이 흔들린다
  const [today] = useState(() => new Date());
  const defaultRange = useMemo(() => toPresetRange(DEFAULT_PRESET, today), [today]);

  const [appliedRange, setAppliedRange] = useState<DateRangeValue>(defaultRange);
  const [draftRange, setDraftRange] = useState<DateRange>(defaultRange);
  // 기본값은 로그인 사용자의 소속 팀. 팀 미배정이면 기존대로 전체 팀을 본다.
  // 초기값 계산이라 이후 사용자가 고른 값을 덮어쓰지 않는다.
  const [teamId, setTeamId] = useState(() =>
    user?.teamId != null ? String(user.teamId) : ALL_TEAMS,
  );
  const [status, setStatus] = useState<string>(ALL_STATUSES);

  const draftValue = toRangeValue(draftRange, defaultRange);

  const selectPreset = (preset: DateRangePreset) => setDraftRange(toPresetRange(preset, today));

  const changeDraftRange = (range: DateRange | undefined) =>
    setDraftRange(range ?? defaultRange);

  const changeTeam = (value: string | null) => setTeamId(value ?? ALL_TEAMS);

  const changeStatus = (value: string | null) => setStatus(value ?? ALL_STATUSES);

  const apply = () => setAppliedRange(draftValue);

  const reset = () => setDraftRange(defaultRange);

  /** 팝오버를 열 때 편집하다 만 값을 적용값으로 되돌린다 */
  const syncDraft = () => setDraftRange(appliedRange);

  return {
    appliedRange,
    teamId,
    changeTeam,
    status,
    changeStatus,

    draftRange,
    draftPreset: matchDateRangePreset(draftValue, today),
    selectPreset,
    changeDraftRange,

    apply,
    reset,
    syncDraft,

    /** 팝오버가 담당하는 조건 중 기본값과 달라진 개수 — 트리거 배지에 쓴다 */
    activeFilterCount: isSameDateRange(appliedRange, defaultRange) ? 0 : 1,
  };
};
