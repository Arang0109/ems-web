import { Badge, StatusDot } from "@shared/ui/badges";
import { EmptyText } from "@shared/ui/feedback";

import { COMMON_SOURCE_LABEL } from "../../model/derived/sampling-timeline";
import type {
  SamplingTimeline, TimelineIssue, TimelineIssueCode, TimelineIssueLevel, TimelineRow,
} from "../../model/derived/sampling-timeline";
import { buildTimelineGroups, calcRowMinutes, describeMinutes } from "../../model/derived/timeline-groups";
import type { TimelineGroup } from "../../model/derived/timeline-groups";

interface Props {
  timeline: SamplingTimeline;
}

/** 빈 시각 표기 — 인쇄 기록지와 같은 표현을 쓴다 */
const EMPTY_TIME = "--:--";

const LEVEL_LABEL: Record<TimelineIssueLevel, string> = {
  danger: "경고",
  warning: "주의",
};

/**
 * 줄 옆에 붙는 짧은 위반 이름. 어느 항목의 문제인지는 줄이 이미 말하므로 문장 대신 요지만 적는다.
 * `Record` 라 판정 코드가 늘면 컴파일러가 여기를 채우라고 알린다.
 */
const ISSUE_SHORT_LABEL: Record<TimelineIssueCode, string> = {
  "reversed-range": "종료가 시작보다 빠름",
  "outside-total": "총 채취시간 밖",
  "total-missing": "총 채취시간 미입력",
  "zero-duration": "0분",
  "crosses-midnight": "자정 넘김",
};

const rangeText = (row: TimelineRow) => `${row.startText} ~ ${row.endText ?? EMPTY_TIME}`;

const IssueDots = ({ issues }: { issues: TimelineIssue[] }) =>
  issues.map((issue, index) => (
    <StatusDot
      key={`${issue.code}-${index}`}
      tone={issue.level}
      label={`${LEVEL_LABEL[issue.level]} · ${ISSUE_SHORT_LABEL[issue.code]}`}
      className="text-caption"
    />
  ));

interface RowProps {
  row: TimelineRow;
  issues: TimelineIssue[];
}

/** 항목 한 줄 — 왼쪽은 무엇(이름·출처·위반), 오른쪽은 언제(구간·소요) */
const RowItem = ({ row, issues }: RowProps) => {
  const minutes = calcRowMinutes(row);

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3">
      <div className="min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-label text-ink">{row.label}</span>
          {row.sourceLabel && (
            <Badge size="sm" tone={row.sourceLabel === COMMON_SOURCE_LABEL ? "neutral" : "info"}>
              {row.sourceLabel}
            </Badge>
          )}
          {row.endDerived && !row.isMarker && <Badge size="sm" tone="neutral">자동</Badge>}
        </div>
        {issues.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            <IssueDots issues={issues} />
          </div>
        )}
        {row.note && <p className="text-caption text-muted-ink">{row.note}</p>}
      </div>

      <div className="text-right text-caption tabular-nums">
        <div className="text-ink-soft">{rangeText(row)}</div>
        {minutes !== null && <div className="text-muted-ink">{describeMinutes(minutes)}</div>}
      </div>
    </li>
  );
};

/** 묶음 머리의 동시 진행 설명 — 묶음 안 항목이 전부 한순간에 겹쳤는지, 일부만 겹쳤는지 가른다 */
const describeConcurrency = (group: TimelineGroup): string | null => {
  const count = group.rows.length;
  if (count < 2) return null;
  return group.maxConcurrency >= count ? `${count}개 동시` : `${count}개 · 최대 ${group.maxConcurrency}개 동시`;
};

/**
 * 측정 시각 타임라인 — 텍스트로 흐름을 적는다.
 *
 * 간트 막대는 측정이 길어지면 좁아져 읽을 수 없었고, 번호·범례로 보완할수록 오가며 찾는 부담이 늘었다.
 * 막대가 보여 주던 **겹침**은 동시 진행 묶음으로, **빈 시간**은 묶음 사이의 공백 줄로 옮겼다.
 * 위반은 문장 목록을 따로 두지 않고 해당 줄 옆에 요지만 붙인다 — 어느 항목인지는 줄이 이미 말한다.
 */
export const SamplingTimelineView = ({ timeline }: Props) => {
  const { rows, issues } = timeline;

  if (rows.length === 0) {
    return <EmptyText>입력된 시각이 없습니다. 채취 시작시간을 입력하면 타임라인이 표시됩니다.</EmptyText>;
  }

  const { total, groups } = buildTimelineGroups(timeline);
  const issuesOf = (rowId: string) => issues.filter((issue) => issue.rowIds.includes(rowId));
  // 총 채취시간에 걸린 위반과, 특정 행을 가리키지 않는 위반(총 채취시간 미입력)은 머리에 붙인다.
  const headerIssues = issues.filter(
    (issue) => issue.rowIds.length === 0 || (total !== null && issue.rowIds.includes(total.id)),
  );
  const totalMinutes = total ? calcRowMinutes(total) : null;
  const dangerCount = issues.filter((issue) => issue.level === "danger").length;
  const warningCount = issues.length - dangerCount;

  return (
    <div className="space-y-3">
      {/* 총 채취시간 — 모든 묶음을 담는 틀 */}
      <div className="space-y-1 rounded-button bg-brand-soft px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-label text-ink">총 채취시간</span>
            {total ? (
              <span className="text-caption text-ink-soft tabular-nums">
                {rangeText(total)}
                {totalMinutes !== null && totalMinutes > 0 && ` (${describeMinutes(totalMinutes)})`}
              </span>
            ) : (
              <span className="text-caption text-muted-ink">미입력</span>
            )}
          </span>
          {/* 트리거 배지와 같은 수 — 팝오버를 열었을 때 몇 개를 찾아야 하는지 먼저 말한다 */}
          <span className="flex gap-2">
            {dangerCount > 0 && <StatusDot tone="danger" label={`경고 ${dangerCount}`} className="text-caption" />}
            {warningCount > 0 && (
              <StatusDot tone="warning" label={`주의 ${warningCount}`} className="text-caption" />
            )}
          </span>
        </div>
        {headerIssues.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            <IssueDots issues={headerIssues} />
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <EmptyText>세부 항목의 시각이 없습니다.</EmptyText>
      ) : (
        <ol className="space-y-2">
          {groups.map((group) => {
            const concurrency = describeConcurrency(group);

            return (
              <li key={group.id} className="space-y-2">
                {group.gapBeforeMinutes !== null && (
                  <p className="text-center text-caption text-muted-ink">
                    ··· {describeMinutes(group.gapBeforeMinutes)} 공백 ···
                  </p>
                )}

                <section className="space-y-2 rounded-button border border-rule px-3 py-2">
                  {/* 묶음이 한 항목뿐이면 머리가 그 항목과 같은 말을 되풀이하므로 두지 않는다 */}
                  {group.rows.length > 1 && (
                    <header className="flex items-baseline justify-between gap-2 border-b border-rule pb-1.5">
                      <span className="text-caption text-ink tabular-nums">
                        {group.startText} ~ {group.endText}
                      </span>
                      {concurrency && <span className="text-caption text-muted-ink">{concurrency}</span>}
                    </header>
                  )}
                  <ul className="space-y-2">
                    {group.rows.map((row) => (
                      <RowItem key={row.id} row={row} issues={issuesOf(row.id)} />
                    ))}
                  </ul>
                </section>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
