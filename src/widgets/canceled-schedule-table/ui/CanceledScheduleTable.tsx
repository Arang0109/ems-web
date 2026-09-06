import { XCircle } from 'lucide-react';

import { BasicTable, TableEmptyState, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';

import { useCanceledScheduleTable } from '../model/use-canceled-schedule-table';

/**
 * 취소된 측정계획 목록. 행마다 삭제 버튼을 둔다.
 * 취소 건에는 이력으로 남겨 둬야 할 것과 애초에 잘못 만들어진 것이 섞여 있어,
 * 후자를 골라 지우는 것이 이 화면의 목적이다.
 */
export const CanceledScheduleTable = () => {
  const { table, globalFilter, setGlobalFilter, isLoading, error } = useCanceledScheduleTable();

  return (
    <div>
      <div className="mt-3 flex items-center gap-2">
        <Search
          className="w-full"
          filter={globalFilter}
          setFilter={setGlobalFilter}
          placeholder={'관리번호, 시설, 팀 검색'}
        />
      </div>

      <div className="py-5 flex-1 flex flex-col">
        <BasicTable
          table={table}
          loading={isLoading}
          error={error}
          // 행마다 삭제 버튼이 있어 카드 자동 배치가 어긋나므로 모든 폭에서 표로 둔다.
          mobileCard={false}
          emptyState={
            <TableEmptyState
              icon={<XCircle className="size-5 text-muted-ink" />}
              label="취소된 측정계획이 없습니다."
              subLabel="측정이 무산되어 취소한 계획이 여기에 모입니다."
            />
          }
        />
      </div>

      {!isLoading && !error && (
        <TableFooterBar table={table} className="bg-canvas py-1" />
      )}
    </div>
  );
};
