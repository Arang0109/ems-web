import { PageLayout } from "@shared/ui/layout";
import { Panel } from "@shared/ui/cards";

import { RegisterContractForm } from '@features/register-contract';

export const ContractRegisterPage = () => {

  return(
    <PageLayout
      title="계약서 등록"
      description="계약서 등록 페이지입니다."
      showBack
      backTo="/contracts"
    >
      <Panel>
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <RegisterContractForm />
        </div>
      </Panel>
    </PageLayout>
  );
}
