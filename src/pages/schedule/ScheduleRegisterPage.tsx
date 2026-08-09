import { PageLayout } from "@shared/ui/layout";
import { Panel } from "@shared/ui/cards";

import { RegisterScheduleForm } from "@features/register-schedule";

export const ScheduleRegisterPage = () => {
  return (
    <PageLayout title="측정계획 등록" description="측정계획 등록 페이지입니다.">
      <Panel>
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <RegisterScheduleForm />
        </div>
      </Panel>
    </PageLayout>
  );
};
