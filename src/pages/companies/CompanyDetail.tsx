import { PageTitle } from "@shared/ui/semantics";

import { useCompanyDetailViewModel } from "@features/company-detail";

export const CompanyDetail = () => {
  const { company } = useCompanyDetailViewModel();

  const companyD = company?.company;

  return (
    <div className="p-6">
      <PageTitle title={`${companyD?.companyName}`} description="거래처 상세정보를 확인할 수 있습니다."/>
    </div>
  );
}