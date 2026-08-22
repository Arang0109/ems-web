import { PageLayout } from "@shared/ui/layout";

import { PollutantCatalogTable } from "@widgets/pollutant-catalog-table";

export const PlatformPollutantCatalogPage = () => {
  return (
    <PageLayout
      title="측정물질 카탈로그"
      description="모든 고객사가 공통으로 사용하는 법정 측정물질을 관리합니다. 여기서 바꾼 값은 따로 덮어쓰지 않은 모든 고객사에 반영됩니다."
    >
      <PollutantCatalogTable />
    </PageLayout>
  );
}
