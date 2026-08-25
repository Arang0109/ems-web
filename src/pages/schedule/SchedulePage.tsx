import { useLocation, useNavigate } from "react-router-dom";

import { ScheduleTable } from "@widgets/schedule-table";

import { PageLayout } from "@shared/ui/layout";
import { Button } from "@shared/ui/buttons";
import { Plus, XCircle } from "lucide-react";

import { toScheduleListState } from "./model/list-location";

export const SchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goRegister = () => navigate("/schedule/register");

  return (
    <PageLayout
      title="측정 계획"
      description="측정계획을 조회하고 신규 측정계획을 등록할 수 있습니다."
      className="space-y-4 md:space-y-5"
      actions={
        <>
          {/* 취소된 계획은 목록에서 빠지므로 진입점을 여기 둔다 */}
          <Button
            className="hidden md:inline-flex"
            variant="outline"
            startIcon={XCircle}
            onClick={() => navigate("/schedule/canceled")}
          >
            취소된 계획
          </Button>

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
      {/* 조회 조건은 URL 쿼리에 있다 — 상세의 뒤로가기가 보던 목록으로 되돌아오도록 실어 보낸다 */}
      <ScheduleTable
        onRowClick={(row) =>
          navigate(`/schedule/${row.id}`, { state: toScheduleListState(location.search) })
        }
      />
    </PageLayout>
  );
};
