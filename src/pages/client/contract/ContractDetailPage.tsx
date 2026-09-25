import { useParams } from "react-router";

import { useContractDetail } from "@entities/contract";
import { ContractDetailForm } from "@features/update-contract";

import { PageLayout } from "@shared/ui/layout";
import { Panel } from "@shared/ui/cards";
import { ErrorText } from "@shared/ui/feedback";

export const ContractDetailPage = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const { data, isLoading: loading, error } = useContractDetail(
    contractId ? Number(contractId) : null,
  );

  return (
    <PageLayout
      title="계약서 상세"
      description="계약서 상세정보 관리 페이지입니다."
      showBack
      backTo="/contracts"
    >
      {loading && <p className="text-body-2 text-muted-ink">불러오는 중...</p>}
      <ErrorText>{error}</ErrorText>
      {data && (
        <Panel className="px-5 pt-5 pb-4 border-b border-rule">
          <ContractDetailForm key={data.id} contract={data} />
        </Panel>
      )}
    </PageLayout>
  );
};
