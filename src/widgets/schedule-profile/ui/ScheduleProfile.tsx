import { useMemo } from "react";
import { useParams } from "react-router";

import { getSheetCalcExternals } from "@entities/schedule";
import type { SheetCalcExternals } from "@entities/schedule";
import { SCHEDULE_STATUS_LABEL } from "@shared/config";
import { Tabs } from "@shared/ui/tabs";
import { Button } from "@shared/ui/buttons";

import { useScheduleProfile } from "../model/use-schedule-profile";
import { value } from "../model/mapper";
import { MeasurementInfo } from "./children/MeasurementInfo";
import { EquipmentInfo } from "./children/EquipmentInfo";
import { SheetInput } from "./children/SheetInput";

export const ScheduleProfile = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { snapshot, scheduleId: id, status, editable, loading, error, refetch, handleDelete, deleteLoading } = useScheduleProfile(scheduleId);

  // 시트 계산 미리보기용 외부입력(표준산소·굴뚝 치수·장비 spec)을 스냅샷에서 1회 추출한다.
  const externals = useMemo<SheetCalcExternals>(
    () =>
      snapshot
        ? getSheetCalcExternals(snapshot)
        : {
            standardOxygen: null, shape: null, horizontalLength: null, verticalLength: null,
            pitotCoefficients: [], deltaH: null, nozzleDiameters: [],
          },
    [snapshot],
  );

  if (loading) {
    return <p className="text-body-2 text-muted-foreground text-center py-12">불러오는 중...</p>;
  }
  if (error || !snapshot) {
    return <p className="text-body-2 text-destructive text-center py-12">{error ?? "측정계획을 찾을 수 없습니다."}</p>;
  }

  const tabOptions = [
    {
      value: "info",
      label: "측정정보",
      content: <MeasurementInfo scheduleId={id} snapshot={snapshot} editable={editable} onRefetch={refetch} />,
    },
    {
      value: "equipment",
      label: "측정장비",
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
      content: (
        <SheetInput scheduleId={id} sheets={snapshot.sheets} snapshot={snapshot}
          editable={editable} externals={externals} onSaved={refetch} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-body-2 text-muted-foreground">관리번호</span>
        <span className="text-body-4 text-foreground">{value(snapshot.referenceNumber)}</span>
        {status && (
          <span className="rounded-button bg-primary/10 px-2 py-0.5 text-label text-primary">
            {SCHEDULE_STATUS_LABEL[status]}
          </span>
        )}
      </div>
      <Button size="sm" variant="destructive" onClick={() => handleDelete()}>
        {deleteLoading ? "삭제 중..." : "측정계획 삭제"}
      </Button>
      <Tabs gap={5} options={tabOptions} />
    </div>
  );
};
