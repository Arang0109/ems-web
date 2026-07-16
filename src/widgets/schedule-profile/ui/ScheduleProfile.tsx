import { useParams } from "react-router";

import { SCHEDULE_STATUS_LABEL } from "@shared/config";
import { Tabs } from "@shared/ui/tabs";

import { useScheduleProfile } from "../model/use-schedule-profile";
import { value } from "../model/mapper";
import { MeasurementInfo } from "./children/MeasurementInfo";
import { EquipmentInfo } from "./children/EquipmentInfo";
import { SheetInput } from "./children/SheetInput";

export const ScheduleProfile = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { snapshot, scheduleId: id, status, editable, loading, error, refetch } = useScheduleProfile(scheduleId);

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>;
  }
  if (error || !snapshot) {
    return <p className="text-sm text-destructive text-center py-12">{error ?? "측정계획을 찾을 수 없습니다."}</p>;
  }

  const tabOptions = [
    { value: "info", label: "측정정보", content: <MeasurementInfo snapshot={snapshot} /> },
    { value: "equipment", label: "측정장비", content: <EquipmentInfo equipments={snapshot.equipments} /> },
    {
      value: "data",
      label: "측정 데이터",
      content: <SheetInput scheduleId={id} sheets={snapshot.sheets} editable={editable} onSaved={refetch} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">관리번호</span>
        <span className="text-sm font-semibold text-foreground">{value(snapshot.referenceNumber)}</span>
        {status && (
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {SCHEDULE_STATUS_LABEL[status]}
          </span>
        )}
      </div>

      <Tabs gap={5} options={tabOptions} />
    </div>
  );
};
