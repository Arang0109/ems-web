import { authHandlers } from './auth';
import { dashboardHandlers } from './dashboard';
import { companyHandlers } from './company';
import { stackHandlers } from './stack';
import { contractHandlers } from './contract';

// 마커: [ACTIVE] 개발 중 | [READY] 구현 완료 비활성 | [WIP] 작성 중
export const handlers = [
  // [WIP]    로그인 페이지 개발 시 활성화
  ...authHandlers,

  // [ACTIVE]
  ...dashboardHandlers,

  // [ACTIVE]
  ...companyHandlers,

  // [READY]
  ...stackHandlers,

  // [READY]
  ...contractHandlers,
];
