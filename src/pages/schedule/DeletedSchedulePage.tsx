import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { DeletedScheduleTable } from "@widgets/deleted-schedule-table";

import { PageLayout } from "@shared/ui/layout";
import { Button } from "@shared/ui/buttons";

export const DeletedSchedulePage = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      title="삭제된 측정계획"
      description="잘못 등록되어 감춰진 측정계획입니다. 복구하면 삭제 시점의 상태로 목록에 되돌아갑니다."
      className="space-y-4 md:space-y-5"
      actions={
        <Button variant="outline" startIcon={ChevronLeft} onClick={() => navigate("/schedule")}>
          측정계획 목록
        </Button>
      }
    >
      <DeletedScheduleTable />
    </PageLayout>
  );
};
