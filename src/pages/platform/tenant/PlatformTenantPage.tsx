import { PageTitle } from "@shared/ui/semantics";

import { TenantTable } from "@widgets/tenant-table";

export const PlatformTenantPage = () => {
  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="고객사 관리" description="서비스 고객사(테넌트)를 발급하고 조회합니다." />

      <TenantTable />
    </div>
  );
}
