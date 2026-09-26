import { ContractProfile } from "@widgets/contract-profile";

import { PageLayout } from "@shared/ui/layout";

export const ContractDetailPage = () => (
  <PageLayout
    title="계약서 상세"
    description="계약서 상세정보 관리 페이지입니다."
    showBack
    backTo="/contracts"
  >
    <ContractProfile />
  </PageLayout>
);
