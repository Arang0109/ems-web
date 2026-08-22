import { useNavigate } from "react-router-dom";

import { useAuth, isAdmin } from "@entities/auth";

import { ScheduleTable } from "@widgets/schedule-table";

import { PageLayout } from "@shared/ui/layout";
import { Button } from "@shared/ui/buttons";
import { Plus, Trash2, XCircle } from "lucide-react";

export const SchedulePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

          {/* 삭제(감춤)된 계획의 복구는 관리자만 한다 */}
          {isAdmin(user?.role) && (
            <Button
              className="hidden md:inline-flex"
              variant="outline"
              startIcon={Trash2}
              onClick={() => navigate("/schedule/deleted")}
            >
              삭제된 계획
            </Button>
          )}

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
