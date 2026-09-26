import { useParams } from "react-router";

import { ContractDetailForm } from "@features/update-contract";

import { Panel } from "@shared/ui/cards";
import { ErrorText } from "@shared/ui/feedback";

import { useContractProfile } from "../model/use-contract-profile";

/** 계약서 상세 — 라우트의 `contractId` 로 계약을 조회해 수정 폼에 넘긴다. */
export const ContractProfile = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const { contract, isLoading, error } = useContractProfile(contractId);

  return (
    <>
      {isLoading && <p className="text-body-2 text-muted-ink">불러오는 중...</p>}
      <ErrorText>{error}</ErrorText>
      {contract && (
        <Panel className="px-5 pt-5 pb-4 border-b border-rule">
          <ContractDetailForm key={contract.id} contract={contract} />
        </Panel>
      )}
    </>
  );
};
