import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { CanceledScheduleTable } from "@widgets/canceled-schedule-table";

import { PageLayout } from "@shared/ui/layout";
import { Button } from "@shared/ui/buttons";

export const CanceledSchedulePage = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      title="취소된 측정계획"
      description="측정이 무산되어 취소한 계획입니다. 실수로 만들어진 계획은 삭제해 목록에서 감출 수 있습니다."
      className="space-y-4 md:space-y-5"
      actions={
        <Button variant="outline" startIcon={ChevronLeft} onClick={() => navigate("/schedule")}>
          측정계획 목록
        </Button>
      }
    >
      <CanceledScheduleTable />
    </PageLayout>
  );
};
