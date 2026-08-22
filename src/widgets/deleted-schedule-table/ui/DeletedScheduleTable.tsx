import { Trash2 } from 'lucide-react';

import { BasicTable, TableEmptyState, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';

import { useDeletedScheduleTable } from '../model/use-deleted-schedule-table';

/**
 * 삭제(감춤)된 측정계획 목록. 관리자만 접근하며 행마다 복구 버튼을 둔다.
 * 취소된 계획은 여기 오지 않는다 — 취소는 남는 이력이라 일반 목록에 그대로 표시된다.
 */
export const DeletedScheduleTable = () => {
  const { table, globalFilter, setGlobalFilter, isLoading, error } = useDeletedScheduleTable();

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
          // 행마다 복구 버튼이 있어 카드 자동 배치가 어긋나므로 모든 폭에서 표로 둔다.
          mobileCard={false}
          emptyState={
            <TableEmptyState
              icon={<Trash2 className="size-5 text-muted-ink" />}
              label="삭제된 측정계획이 없습니다."
              subLabel="잘못 등록한 측정계획을 삭제하면 여기에서 복구할 수 있습니다."
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
