import { useNavigate } from "react-router-dom";

import { ScheduleTable } from "@widgets/schedule-table";

import { PageTitle } from "@shared/ui/semantics";
import { Button } from "@shared/ui/buttons";

export const SchedulePage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-5 min-h-full">
      <div className="flex items-start justify-between gap-3">
        <PageTitle title="측정 계획" description="측정계획을 조회하고 신규 측정계획을 등록할 수 있습니다." />
        <Button type="button" onClick={() => navigate("/schedule/register")}>측정계획 등록</Button>
      </div>

      <ScheduleTable onRowClick={(row) => navigate(`/schedule/${row.id}`)} />
    </div>
  );
};
