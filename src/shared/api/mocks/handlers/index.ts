import { authHandlers } from './auth';
import { dashboardHandlers } from './dashboard';
import { companyHandlers } from './company';

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...companyHandlers,
];
