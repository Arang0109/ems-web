import { useNavigate } from "react-router-dom";

import { ScheduleTable } from "@widgets/schedule-table";

import { PageLayout } from "@shared/ui/layout";
import { Button } from "@shared/ui/buttons";
import { Plus } from "lucide-react";

export const SchedulePage = () => {
  const navigate = useNavigate();

  const goRegister = () => navigate("/schedule/register");

  return (
    <PageLayout
      title="측정 계획"
      description="측정계획을 조회하고 신규 측정계획을 등록할 수 있습니다."
      className="space-y-4 md:space-y-5"
      actions={
        <>
          {/* 모바일 — 피그마 MO 시안의 36px 정사각 아이콘 버튼 */}
          <Button
            className="md:hidden"
            size="icon"
            startIcon={Plus}
            aria-label="측정계획 등록"
            onClick={goRegister}
          />
          <Button className="hidden md:inline-flex" startIcon={Plus} onClick={goRegister}>
            등록
          </Button>
        </>
      }
    >
      <ScheduleTable onRowClick={(row) => navigate(`/schedule/${row.id}`)} />
    </PageLayout>
  );
};
