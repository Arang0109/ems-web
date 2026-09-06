import { useLocation } from "react-router";

import { ScheduleProfile } from "@widgets/schedule-profile";

import { PageLayout } from "@shared/ui/layout";

import { readScheduleListSearch } from "./model/list-location";

// 현장 입력 화면이라 모바일이 1순위 — 좌우 여백(MO 시안 16px)은 MainLayout 의 px-4 가 담당한다.
export const ScheduleDetailPage = () => {
  // 목록에서 들어왔으면 그때의 조회 조건으로 돌아간다. 대시보드·직접 진입은 기본 목록으로.
  const backTo = `/schedule${readScheduleListSearch(useLocation().state)}`;

  return (
    <PageLayout
      title="측정계획 상세"
      description="측정정보·측정장비를 확인하고 현장 측정 데이터를 입력합니다."
      showBack
      backTo={backTo}
    >
      <ScheduleProfile />
    </PageLayout>
  );
};
