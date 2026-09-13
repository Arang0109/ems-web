import { useParams } from "react-router";

import { useScheduleDetail } from "@entities/schedule";

import { MEASUREMENT_FIELD_LABEL } from "@shared/config";

import { value } from "../model/mapper";

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-caption text-ink">{value(stackName)}</span>
      <span className="text-caption text-ink">|</span>
      <span className="text-caption text-ink">{value(data.referenceNumber)}</span>
      <span className="text-caption text-ink">|</span>
      <span className="text-caption text-ink">{value(MEASUREMENT_FIELD_LABEL[data.measurementField])}</span>
    </div>
  );
};
