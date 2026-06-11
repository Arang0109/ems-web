import { PageTitle } from "@shared/ui/semantics";

import { RegisterContractForm } from '@features/register-contract';

export const ContractRegisterPage = () => {

  return(
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="계약서 등록" description="계약서 등록 페이지입니다."/>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">          
          <RegisterContractForm />
        </div>
      </div>
      
    </div>
  );
}