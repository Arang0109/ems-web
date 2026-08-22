import { cn } from "@/lib/utils";
import { Badge, StatusDot } from "@shared/ui/badges";
import { EmptyText } from "@shared/ui/feedback";

import type { SamplingTimeline, TimelineIssueLevel, TimelineRow } from "../../model/sampling-timeline";

interface Props {
  timeline: SamplingTimeline;
}

/** 빈 시각 표기 — 인쇄 기록지와 같은 표현을 쓴다 */
const EMPTY_TIME = "--:--";

/** 폭이 0 이면 막대가 사라지므로 최소한의 두께를 남긴다 */
const MIN_BAR_WIDTH_PERCENT = 0.8;

const LEVEL_LABEL: Record<TimelineIssueLevel, string> = {
  danger: "경고",
  warning: "주의",
};

/**
 * 행 막대의 면색. `total` 은 다른 행을 담는 배경이라 채도를 낮춘다.
 *
 * 색만으로 상태를 구분하지 않는다 — 같은 정보가 라벨 옆 `StatusDot`(점 + 텍스트)과
 * 우측 시각 텍스트, 하단 위반 목록에 중복해 담긴다.
 */
const barToneClass = (kind: TimelineRow["kind"], level: TimelineIssueLevel | undefined): string => {
  if (level === "danger") return "bg-danger";
  if (level === "warning") return "bg-warning";
  if (kind === "total") return "bg-brand-primary/30 ring-1 ring-brand-primary";
  return "bg-brand-primary";
};

export const SamplingTimelineView = ({ timeline }: Props) => {
  const { rows, axis, issues } = timeline;

  if (!axis || rows.length === 0) {
    return <EmptyText>입력된 시각이 없습니다. 채취 시작시간을 입력하면 타임라인이 표시됩니다.</EmptyText>;
  }

  // 행별 최고 심각도 — 같은 행에 주의와 경고가 겹치면 경고를 따른다.
  const levelByRow = new Map<string, TimelineIssueLevel>();
  issues.forEach((issue) => {
    issue.rowIds.forEach((id) => {
      if (issue.level === "danger" || !levelByRow.has(id)) levelByRow.set(id, issue.level);
    });
  });

  const percent = (offset: number) => (offset / axis.spanMinutes) * 100;

  const totalRow = rows.find((row) => row.kind === "total" && !row.isMarker);

  return (
    <div className="space-y-3">
      {/* 눈금 — 트랙 열과 같은 그리드에 얹어야 데스크탑에서 x축이 맞는다 */}
      <div className="hidden md:grid md:grid-cols-[7rem_minmax(0,1fr)_8.5rem] md:gap-x-3">
        <span />
        <div className="relative h-4">
          {axis.ticks.map((tick) => (
            <span
              key={tick.offset}
              className="absolute top-0 -translate-x-1/2 text-caption text-muted-ink"
              style={{ left: `${percent(tick.offset)}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
        <span />
      </div>

      <ul className="space-y-2">
        {rows.map((row) => {
          const level = levelByRow.get(row.id);
          const left = percent(row.startOffset);
          const width = Math.max(percent(row.endOffset - row.startOffset), MIN_BAR_WIDTH_PERCENT);

          return (
            <li
              key={row.id}
              className="flex flex-col gap-1 md:grid md:grid-cols-[7rem_minmax(0,1fr)_8.5rem] md:items-center md:gap-x-3 md:gap-y-0"
            >
              {/* 모바일은 라벨과 시각이 트랙 위 한 줄에 함께 놓인다 */}
              <div className="flex min-w-0 items-center justify-between gap-2 md:justify-start">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-label text-ink">{row.label}</span>
                  {level && (
                    <StatusDot tone={level} label={LEVEL_LABEL[level]} className="shrink-0 text-caption" />
                  )}
                </span>
                <span className="shrink-0 text-caption text-ink-soft tabular-nums md:hidden">
                  {row.startText} ~ {row.endText ?? EMPTY_TIME}
                </span>
              </div>

              <div className="relative h-6 rounded-button bg-rule/50">
                {/* 총 채취시간 밴드 — 세부 행이 범위를 벗어나면 계산 없이 눈에 보인다 */}
                {totalRow && row.kind !== "total" && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 rounded-button bg-brand-soft"
                    style={{
                      left: `${percent(totalRow.startOffset)}%`,
                      width: `${percent(totalRow.endOffset - totalRow.startOffset)}%`,
                    }}
                  />
                )}

                {row.isMarker ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-ink"
                    style={{ left: `${left}%` }}
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-1 rounded-button transition-[left,width] motion-reduce:transition-none",
                      barToneClass(row.kind, level),
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                )}
              </div>

              <div className="hidden items-center justify-end gap-1 md:flex">
                {row.endDerived && !row.isMarker && <Badge tone="neutral">자동</Badge>}
                <span className="text-caption text-ink-soft tabular-nums">
                  {row.startText} ~ {row.endText ?? EMPTY_TIME}
                </span>
              </div>

              {row.note && <p className="text-caption text-muted-ink md:col-start-2">{row.note}</p>}
            </li>
          );
        })}
      </ul>

      {/* 막대를 보지 않고도 무엇이 문제인지 알 수 있게 문장으로 다시 나열한다 */}
      {issues.length > 0 && (
        <ul className="space-y-1 border-t border-rule pt-3">
          {issues.map((issue, index) => (
            <li key={`${issue.code}-${index}`} className="flex items-start gap-1.5">
              <StatusDot
                tone={issue.level}
                label={LEVEL_LABEL[issue.level]}
                className="shrink-0 text-caption"
              />
              <span className="text-caption text-ink-soft">{issue.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
