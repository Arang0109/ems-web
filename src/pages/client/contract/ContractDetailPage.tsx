import { useEffect } from "react";
import { useParams } from "react-router";

import { useContractDetail } from "@entities/contract";
import { ContractDetailForm } from "@features/update-contract";

import { PageLayout } from "@shared/ui/layout";
import { Panel } from "@shared/ui/cards";

export const ContractDetailPage = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const { data, loading, error, fetchContract } = useContractDetail();

  useEffect(() => {
    if (contractId) fetchContract(Number(contractId));
  }, [contractId, fetchContract]);

  return (
    <PageLayout title="계약서 상세" description="계약서 상세정보 관리 페이지입니다.">
      {loading && <p className="text-body-2 text-muted-foreground">불러오는 중...</p>}
      {error && <p className="text-body-2 text-destructive">{error}</p>}
      {data && (
        <Panel>
          <ContractDetailForm key={data.id} contract={data} />
        </Panel>
      )}
    </PageLayout>
  );
};
