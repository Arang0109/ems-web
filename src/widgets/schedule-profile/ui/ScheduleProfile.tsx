import { useParams } from "react-router";

import { ChangeScheduleStatusActions } from "@features/change-schedule-status";

import { SCHEDULE_STATUS_LABEL, SCHEDULE_STATUS_TONE } from "@shared/config";
import { Tabs } from "@shared/ui/tabs";
import { StatusDot } from "@shared/ui/badges";

import { useScheduleProfile } from "../model/use-schedule-profile";
import { value } from "../model/mapper";
import { MeasurementInfo } from "./children/MeasurementInfo";
import { EquipmentInfo } from "./children/EquipmentInfo";
import { SheetInput } from "./children/SheetInput";

export const ScheduleProfile = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { snapshot, stackPollutants, externals, status, editable, loading, error, refetch } =
    useScheduleProfile(scheduleId);
  const id = Number(scheduleId);

  if (loading) {
    return <p className="py-12 text-center text-body-2 text-muted-ink">불러오는 중...</p>;
  }
  if (error || !snapshot) {
    return <p className="py-12 text-center text-body-2 text-danger">{error ?? "측정계획을 찾을 수 없습니다."}</p>;
  }

  const tabOptions = [
    {
      value: "info",
      label: "측정정보",
      // 본문이 섹션 카드들로 구성되므로 탭의 카드 셸은 끈다.
      panel: false,
      content: (
        <MeasurementInfo
          scheduleId={id}
          snapshot={snapshot}
          stackPollutants={stackPollutants}
          editable={editable}
          onRefetch={refetch}
        />
      ),
    },
    {
      value: "equipment",
      label: "측정장비",
      // 본문이 장비별 섹션 카드로 구성되므로 탭의 카드 셸은 끈다.
      panel: false,
      content: (
        <EquipmentInfo
          scheduleId={id}
          team={snapshot.team}
          equipments={snapshot.equipments}
          editable={editable}
          onRefetch={refetch}
        />
      ),
    },
    {
      value: "data",
      label: "측정 데이터",
      // 본문이 섹션 카드들로 구성되므로 탭의 카드 셸은 끈다.
      panel: false,
      content: (
        <SheetInput scheduleId={id} snapshot={snapshot} editable={editable} externals={externals} onSaved={refetch} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-body-3 text-muted-ink">관리번호</span>
          <span className="text-body-4 text-ink">{value(snapshot.referenceNumber)}</span>
          {status && (
            <StatusDot pill tone={SCHEDULE_STATUS_TONE[status]} label={SCHEDULE_STATUS_LABEL[status]} />
          )}
        </div>

        {/* 완료·취소 확정. 전진(측정중·분석중)은 시트 저장·시료접수일 입력 시 서버가 자동 처리한다. */}
        <ChangeScheduleStatusActions scheduleId={id} status={status} onSuccess={refetch} />
      </div>

      {/* 측정 데이터 탭에서 작성하던 기록지가 탭을 옮겨도 남아 있어야 한다 (탭 본문 언마운트 방지). */}
      <Tabs options={tabOptions} keepMounted />
    </div>
  );
};
