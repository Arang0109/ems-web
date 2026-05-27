import { PageTitle } from '@/shared/ui/sementics';

import { CompanyTable } from '@widgets/company-table';

export const Companies = () => {
  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="거래처 목록" description="거래처 정보를 확인하고 관리할 수 있습니다."/>

      <CompanyTable />
    </div>
  );
}