
import { PageTitle } from "@shared/ui/semantics";



import { RegisterContractForm } from '@features/register-contract';

export const ContractRegisterPage = () => {
  return(
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="계약정보 입력" description="계약서 조회 및 관리 페이지입니다."/>
      <RegisterContractForm />
    </div>
  );
}