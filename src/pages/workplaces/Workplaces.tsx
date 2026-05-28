import { PageTitle } from '@shared/ui/semantics';
import { useContractOverview } from '@features/contract-overview';

import { WorkplaceTable } from '@widgets/workplace-table';
import { ContractChart } from '@widgets/contract-chart';

export const Workplaces = () => {
  const { summary, isLoading, error } = useContractOverview();

  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="사업장 목록" description="사업장 정보를 확인하고 관리할 수 있습니다."/>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {isLoading || !summary ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <ContractChart summary={summary} />
      )}
      
      <WorkplaceTable />
    </div>
  );
}