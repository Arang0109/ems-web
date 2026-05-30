import type { Workplace, WorkplaceTableCols } from './workplace-dtos';

export const workplaceTableColsToWorkplace = (col: WorkplaceTableCols): Workplace => ({
  id: col.id,
  companyId: col.companyId,
  name: col.workplaceName,
  address: col.address,
  bizNumber: col.bizNumber,
});
