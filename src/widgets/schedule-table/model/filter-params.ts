import {
  fromDateKey,
  isSameDateRange,
  toDateKey,
  type DateRangeValue,
} from "@shared/lib";
import { SCHEDULE_STATUS } from "@shared/model";

/** 팀 필터의 "전체" 선택값 */
export const ALL_TEAMS = "all";

/** 상태 필터의 "전체" 선택값 */
export const ALL_STATUSES = "all";

/** 조회 조건을 싣는 쿼리 파라미터 이름 */
export const SCHEDULE_FILTER_PARAM = {
  from: "from",
  to: "to",
  team: "team",
  status: "status",
  page: "page",
} as const;

// 취소된 계획은 이 목록에 오지 않으므로(전용 화면에서 관리) 고를 수 있는 상태에서도 뺀다.
const SELECTABLE_STATUSES: readonly string[] = SCHEDULE_STATUS.filter(
  (status) => status !== "CANCELED",
);

export type ScheduleFilterValues = {
  range: DateRangeValue;
  /** 팀 id 문자열 또는 `ALL_TEAMS` */
  teamId: string;
  /** 상태 코드 또는 `ALL_STATUSES` */
  status: string;
  /** 0-based. 쿼리에는 1-based 로 실린다 */
  pageIndex: number;
};

/** 파라미터가 비었을 때 쓰는 값 — 기간은 프리셋, 팀은 로그인 사용자의 소속 팀에서 온다 */
export type ScheduleFilterDefaults = {
  range: DateRangeValue;
  teamId: string;
};

const readRange = (params: URLSearchParams, fallback: DateRangeValue): DateRangeValue => {
  const from = fromDateKey(params.get(SCHEDULE_FILTER_PARAM.from));
  const to = fromDateKey(params.get(SCHEDULE_FILTER_PARAM.to));

  // 한쪽만 있거나 파싱에 실패하면 구간 전체를 기본값으로 되돌린다
  if (!from || !to) return fallback;

  // 손으로 뒤집어 놓은 URL 은 정상 구간으로 바로잡는다
  return from <= to ? { from, to } : { from: to, to: from };
};

const readPageIndex = (raw: string | null): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? page - 1 : 0;
};

const readStatus = (raw: string | null): string =>
  raw && SELECTABLE_STATUSES.includes(raw) ? raw : ALL_STATUSES;

/**
 * 쿼리에서 조회 조건을 읽는다.
 *
 * 쿼리는 사용자가 손으로 고칠 수 있는 입력이므로 어떤 값이 와도 던지지 않는다 —
 * 알아볼 수 없으면 조용히 기본값으로 떨어진다.
 */
export const readFilterParams = (
  params: URLSearchParams,
  defaults: ScheduleFilterDefaults,
): ScheduleFilterValues => ({
  range: readRange(params, defaults.range),
  teamId: params.get(SCHEDULE_FILTER_PARAM.team) || defaults.teamId,
  status: readStatus(params.get(SCHEDULE_FILTER_PARAM.status)),
  pageIndex: readPageIndex(params.get(SCHEDULE_FILTER_PARAM.page)),
});

/**
 * 조회 조건을 쿼리에 싣는다.
 *
 * **기본값이 모두에게 같은 조건은 파라미터를 지운다** — 필터를 건드리지 않았으면 URL 이
 * `/schedule` 그대로여야 한다. 반대로 **기본값이 사용자마다 다른 팀은 항상 명시한다** —
 * 안 그러면 같은 URL 이 보는 사람의 소속 팀에 따라 다른 목록을 보여준다.
 *
 * 필터와 무관한 파라미터는 건드리지 않는다.
 */
export const writeFilterParams = (
  params: URLSearchParams,
  values: ScheduleFilterValues,
  defaults: ScheduleFilterDefaults,
): URLSearchParams => {
  const next = new URLSearchParams(params);

  const set = (key: string, value: string | null) => {
    if (value === null) next.delete(key);
    else next.set(key, value);
  };

  const isDefaultRange = isSameDateRange(values.range, defaults.range);

  set(SCHEDULE_FILTER_PARAM.from, isDefaultRange ? null : toDateKey(values.range.from));
  set(SCHEDULE_FILTER_PARAM.to, isDefaultRange ? null : toDateKey(values.range.to));
  set(SCHEDULE_FILTER_PARAM.team, values.teamId);
  set(SCHEDULE_FILTER_PARAM.status, values.status === ALL_STATUSES ? null : values.status);
  set(SCHEDULE_FILTER_PARAM.page, values.pageIndex > 0 ? String(values.pageIndex + 1) : null);

  return next;
};
