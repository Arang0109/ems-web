import { useParams } from "react-router";

import { ScheduleLifecycleActions } from "@features/manage-schedule-lifecycle";

import { SCHEDULE_STATUS_LABEL, SCHEDULE_STATUS_TONE } from "@shared/config";
import { Tabs } from "@shared/ui/tabs";
import { StatusDot } from "@shared/ui/badges";

import { useScheduleProfile } from "../model/use-schedule-profile";
import { value } from "../model/mapper";
import { MeasurementInfo } from "./children/MeasurementInfo";
import { EquipmentInfo } from "./children/EquipmentInfo";
import { SheetInput } from "./children/SheetInput";
import { AnalysisInput } from "./children/AnalysisInput";
import { ReportInfo } from "./children/ReportInfo";

export const ScheduleProfile = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { snapshot, stackPollutants, externals, status, editable, loading, error, refetch } =
    useScheduleProfile(scheduleId);
  const id = Number(scheduleId);

  // 최초 로드에서만 화면을 비운다. 저장 후 재조회(refetch)에서도 비우면 탭·스크롤·
  // 열어둔 섹션이 전부 초기화되어, 측정 데이터 탭에서 저장할 때마다 측정정보 탭으로 튕긴다.
  if (loading && !snapshot) {
    return <p className="py-12 text-center text-body-2 text-muted-ink">불러오는 중...</p>;
  }
  // 같은 이유로, 보여줄 스냅샷이 이미 있으면 재조회 실패로 화면을 갈아엎지 않는다
  // (저장 자체의 실패는 저장 경로가 toast 로 알린다).
  if (!snapshot) {
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
      value: "data",
      label: "현장 채취",
      // 본문이 섹션 카드들로 구성되므로 탭의 카드 셸은 끈다.
      panel: false,
      content: (
        <SheetInput scheduleId={id} snapshot={snapshot} status={status} editable={editable} externals={externals} onSaved={refetch} />
      ),
    },
    {
      value: "analysis",
      label: "실험·분석",
      // 본문이 섹션 카드들로 구성되므로 탭의 카드 셸은 끈다.
      panel: false,
      content: (
        <AnalysisInput
          scheduleId={id}
          snapshot={snapshot}
          status={status}
          editable={editable}
          onRefetch={refetch}
        />
      ),
    },
    {
      value: "report",
      label: "성적서",
      // 본문이 섹션 카드로 구성되므로 탭의 카드 셸은 끈다.
      panel: false,
      content: (
        <ReportInfo scheduleId={id} snapshot={snapshot} editable={editable} onRefetch={refetch} />
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
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-body-3 text-muted-ink">{externals.stackName} | </span>
          <span className="text-body-4 text-ink">{value(snapshot.basicInfo?.referenceNumber)}</span>
          {status && (
            <StatusDot pill tone={SCHEDULE_STATUS_TONE[status]} label={SCHEDULE_STATUS_LABEL[status]} className="text-body-3" />
          )}
        </div>

        {/*
          생애주기 확정(완료·취소·삭제·재개방).
          전진(측정중·분석값입력중)은 채취 시작시각·실측값·시료접수일 입력 시 서버가 자동 처리한다.
        */}
        <div className="flex flex-wrap items-center gap-2">
          <ScheduleLifecycleActions scheduleId={id} status={status} onSuccess={refetch} />
        </div>
      </div>

      {/* 측정 데이터 탭에서 작성하던 기록지가 탭을 옮겨도 남아 있어야 한다 (탭 본문 언마운트 방지). */}
      <Tabs options={tabOptions} keepMounted />
    </div>
  );
};
