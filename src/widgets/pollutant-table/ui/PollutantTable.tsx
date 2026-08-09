import { usePollutantTable } from '../model/use-pollutant-table';

import { RegisterPollutantForm } from '@features/register-pollutant';

import { BasicTable, TableFooterBar, TablePanel } from '@shared/ui/table';

export const PollutantTable = () => {
  const { table, registerModalOpen, setRegisterModalOpen, loading, error, refetch } = usePollutantTable();

  return (
    <TablePanel
      title="측정물질 목록"
      actions={
        <RegisterPollutantForm
          open={registerModalOpen}
          onOpenChange={setRegisterModalOpen}
          onSuccess={refetch}
        />
      }
      footer={!loading && !error && <TableFooterBar table={table} />}
    >
      <BasicTable table={table} loading={loading} error={error} />
    </TablePanel>
  );
};
