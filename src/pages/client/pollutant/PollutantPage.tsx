
import { PollutantTable } from "@widgets/pollutant-table";
import { PageLayout } from "@shared/ui/layout";

export const PollutantPage = () => {
  return(
    <PageLayout title="측정물질 조회/관리" description="측정물질 조회 및 관리 페이지입니다.">
      <PollutantTable />
    </PageLayout>
  );
}
