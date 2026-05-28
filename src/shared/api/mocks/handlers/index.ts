import { authHandlers } from './auth';
import { dashboardHandlers } from './dashboard';
import { workplaceHandlers } from './workplace';

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...workplaceHandlers,
];
