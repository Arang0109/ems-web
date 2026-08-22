import { useStackTable } from '../model/use-stack-table';

import type { Workplace } from '@entities/workplace';
import type { StackListItem } from '@entities/stack';

import { RegisterStackForm } from '@features/register-stack';

import { Building2 } from 'lucide-react';

import { BasicTable, TableEmptyState, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Panel } from '@shared/ui/cards';
import { useRemountKey } from '@shared/model';

interface Props {
  stacks: StackListItem[];
  loading: boolean;
  error: string | null;
  selectedWorkplace: Workplace | null;
  onSuccess?: () => void;
}

export const StackTable = ({
  stacks, loading, error, selectedWorkplace, onSuccess
}: Props) => {
  const {
    table,
    registerModalOpen, setRegisterModalOpen,
    globalFilter, setGlobalFilter,
  } = useStackTable({ stacks });

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);

  return (
    <Panel className="p-0 flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-canvas p-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-h3 text-foreground">측정지점(굴뚝) 목록</h2>
            {selectedWorkplace ? (
              <p className="mt-0.5 text-label text-brand-primary truncate">
                {selectedWorkplace.name}
              </p>
            ) : (
              <p className="mt-0.5 text-caption text-muted-foreground">
                사업장을 선택해주세요
              </p>
            )}
            
        </div>
        <div className="flex items-center justify-end gap-2">
          <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'측정지점, 측정분야 검색 ...'} />
          <RegisterStackForm
            key={registerFormKey}
            workplace={selectedWorkplace}
            open={registerModalOpen}
            onOpenChange={setRegisterModalOpen}
            onSuccess={onSuccess}
          />
        </div>
      </header>

      {/* 컨텐츠 */}
      <div className="bg-canvas">
        {!selectedWorkplace ? (
          <TableEmptyState
            icon={<Building2 size={22} className="text-muted-foreground" />}
            label='측정지점 정보 없음'
            subLabel={<span>위쪽에서 사업장을 선택하면<br />측정지점 목록이 표시됩니다.</span>}
          />
        ) : (
          <BasicTable table={table} error={error} />
        )}
      </div>

      {/* 푸터: 건수 + 페이지네이션 */}
      {!loading && !error && (
        <TableFooterBar table={table} className="bg-canvas py-1" />
      )}
    </Panel>
  );
}
