import { useParams } from "react-router";

import { Tabs } from "@shared/ui/tabs";

import { useScheduleProfile } from "../model/use-schedule-profile";
import { MeasurementInfo } from "./children/MeasurementInfo";
import { EquipmentInfo } from "./children/EquipmentInfo";
import { SheetInput } from "./children/SheetInput";
import { AnalysisInput } from "./children/AnalysisInput";
import { ReportInfo } from "./children/ReportInfo";

export const ScheduleProfile = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { detail, snapshot, stackPollutants, externals, status, editable, isLoading, error, refetch } =
    useScheduleProfile(scheduleId);
  const id = Number(scheduleId);

  // 최초 로드에서만 화면을 비운다. 저장 후 재조회(refetch)에서도 비우면 탭·스크롤·
  // 열어둔 섹션이 전부 초기화되어, 측정 데이터 탭에서 저장할 때마다 측정정보 탭으로 튕긴다.
  if (isLoading && !snapshot) {
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
          schedule={detail}
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
        <SheetInput scheduleId={id} schedule={detail} snapshot={snapshot} status={status} editable={editable} externals={externals} onSaved={refetch} />
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
          schedule={detail}
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
          equipments={snapshot.team.equipments}
          editable={editable}
          onRefetch={refetch}
        />
      ),
    },
  ];

  // 제목 옆 식별 정보·생애주기 액션은 페이지 셸 슬롯에 들어간다 (ScheduleProfileHeadline·ScheduleProfileActions).
  // 측정 데이터 탭에서 작성하던 기록지가 탭을 옮겨도 남아 있어야 한다 (탭 본문 언마운트 방지).
  return <Tabs options={tabOptions} keepMounted />;
};
