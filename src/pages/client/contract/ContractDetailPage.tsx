import { useEffect } from "react";
import { useParams } from "react-router";

import { useContractDetail } from "@entities/contract";
import { ContractDetailForm, toContractUpdateForm } from "@features/update-contract";

import { PageTitle } from "@shared/ui/semantics";
import { Panel } from "@shared/ui/cards";

export const ContractDetailPage = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const { data, loading, error, fetchContract } = useContractDetail();

  useEffect(() => {
    if (contractId) fetchContract(Number(contractId));
  }, [contractId, fetchContract]);

  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="계약서 상세" description="계약서 상세정보 관리 페이지입니다." />
      {loading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {data && (
        <Panel>
          <ContractDetailForm
            key={data.id}
            contractId={data.id}
            initial={toContractUpdateForm(data)}
          />
        </Panel>
      )}
    </div>
  );
};
