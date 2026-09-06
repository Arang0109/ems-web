import { useContractTable } from '../model/use-contract-table';

import { BasicTable, TableFooterBar } from '@shared/ui/table';
import { Search } from '@shared/ui/form';
import { Panel } from '@shared/ui/cards';

export const ContractTable = () => {
  const { table, isLoading, error, globalFilter, setGlobalFilter } = useContractTable();

  return (
    <Panel className="p-0 flex flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-canvas p-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-h3 text-foreground">계약서 목록</h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Search filter={globalFilter} setFilter={setGlobalFilter} placeholder={'계약서 검색 ...'} />
        </div>
      </header>

      <div className="bg-canvas">
        <BasicTable table={table} />
      </div>

      {!isLoading && !error && (
        <TableFooterBar table={table} className="bg-canvas py-1" />
      )}
    </Panel>
  );
}
