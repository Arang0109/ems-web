import { useStackListTable } from '../model/use-stack-list-table';

import { BasicTable, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Panel } from '@shared/ui/cards';

export const StackListTable = () => {
  const {
    table,
    loading, error,
    globalFilter, setGlobalFilter,
  } = useStackListTable();

  return (
    <Panel className="p-0 flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-canvas p-2">
        <h2 className="text-h3 text-foreground">측정시설 목록</h2>

        <div className="flex items-center justify-end gap-2">
          <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'측정시설, 측정분야 검색 ...'} />
        </div>
      </header>

      

      <div className="bg-canvas">
        <BasicTable table={table} error={error} />
      </div>

      {!loading && !error && (
        <TableFooterBar table={table} className="bg-canvas py-1" />
      )}
    </Panel>
  );
};
