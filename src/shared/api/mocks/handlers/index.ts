import { authHandlers } from './auth';
import { dashboardHandlers } from './dashboard';
import { companyHandlers } from './company';
import { stackHandlers } from './stack';

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...companyHandlers,
  ...stackHandlers,
];
