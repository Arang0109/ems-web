import { MeasurementMethodTable } from "@widgets/measurement-method-table";
import { PageLayout } from "@shared/ui/layout";

export const MeasurementMethodPage = () => {
  return (
    <PageLayout
      title="측정방법 관리"
      description="측정물질을 채택할 때 고를 측정방법(채취 매체·방식)과 채취 단위·표준 채취시간을 관리합니다."
    >
      <MeasurementMethodTable />
    </PageLayout>
  );
};
