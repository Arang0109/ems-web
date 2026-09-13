import { useParams } from "react-router";

import { useScheduleDetail } from "@entities/schedule";
import { ScheduleLifecycleActions } from "@features/manage-schedule-lifecycle";

/**
 * 페이지 제목 우측의 생애주기 확정 액션(완료·취소·삭제·재개방).
 * 전진(측정중·분석값입력중)은 채취 시작시각·실측값·시료접수일 입력 시 서버가 자동 처리한다.
 *
 * `PageLayout` 의 `actions` 슬롯에 들어간다. 본문과 같은 상세 쿼리를 구독한다.
 */
export const ScheduleProfileActions = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const id = Number(scheduleId);
  const { data, refetch } = useScheduleDetail(scheduleId ? id : null);

  if (!data) return null;

  return <ScheduleLifecycleActions scheduleId={id} status={data.status} onSuccess={refetch} />;
};
