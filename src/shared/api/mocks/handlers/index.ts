import { authHandlers } from './auth';
import { dashboardHandlers } from './dashboard';
import { companyHandlers } from './company';
import { stackHandlers } from './stack';
import { contractHandlers } from './contract';

export const handlers = [
  // ...authHandlers,
  ...dashboardHandlers,
  // ...companyHandlers,
  // ...stackHandlers,
  ...contractHandlers,
];
