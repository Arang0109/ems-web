import { ScheduleCustomFieldTable } from "@widgets/schedule-custom-field-table";
import { PageLayout } from "@shared/ui/layout";

export const AdminCustomFieldPage = () => {
  return (
    <PageLayout
      title="커스텀 필드 관리"
      description="성적서(채취기록부) 양식이 ${custom.키} 로 읽을 항목을 정의합니다. 값은 측정계획마다 '추가 항목' 탭에서 입력합니다."
    >
      <ScheduleCustomFieldTable />
    </PageLayout>
  );
};
