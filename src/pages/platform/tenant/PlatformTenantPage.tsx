import { PageLayout } from "@shared/ui/layout";

import { TenantTable } from "@widgets/tenant-table";

export const PlatformTenantPage = () => {
  return (
    <PageLayout title="고객사 관리" description="서비스 고객사(테넌트)를 발급하고 조회합니다.">
      <TenantTable />
    </PageLayout>
  );
}
