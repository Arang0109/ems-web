import { useParams } from "react-router";

import { useScheduleDetail } from "@entities/schedule";

import { displayValue } from "@shared/lib";
import { MEASUREMENT_FIELD_LABEL } from "@shared/config";


/**
 * 페이지 제목 옆에 붙는 측정계획 식별 정보 — 측정시설명 · 접수번호 · 상태.
 *
 * `PageLayout` 의 `subtitle` 슬롯에 들어간다. 본문(`ScheduleProfile`)과 같은 상세 쿼리를
 * 구독하므로 요청은 한 번이고, 저장·생애주기 변경으로 캐시가 갱신되면 함께 바뀐다.
 */
export const ScheduleProfileHeadline = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { data } = useScheduleDetail(scheduleId ? Number(scheduleId) : null);

  if (!data) return null;

  const stackName = data.snapshot?.client?.workplace?.stack?.name;

  // 피그마 MO 시안의 pill 칩 — py-0.75 : 테두리 포함 높이 25px (PageLayout stickyHeader 칩 줄 높이와 맞춘다)
  return (
    <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-rule bg-canvas px-2 py-0.75">
      <span className="text-label text-ink-soft">{displayValue(stackName)}</span>
      <span className="text-caption text-muted-ink">|</span>
      <span className="text-label text-ink-soft">{displayValue(data.referenceNumber)}</span>
      <span className="text-caption text-muted-ink">|</span>
      <span className="text-label text-ink-soft">{displayValue(MEASUREMENT_FIELD_LABEL[data.measurementField])}</span>
    </div>
  );
};
