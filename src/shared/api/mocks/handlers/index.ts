// 아래 도메인 핸들러는 필요 시 import와 spread를 함께 해제한다.
import { authHandlers } from './auth';
import { tenantHandlers } from './tenant';
import { dashboardHandlers } from './dashboard';
import { clientHandlers } from './client';
import { stackHandlers } from './stack';
import { stackPollutantHandlers } from './stack-pollutant';
import { contractHandlers } from './contract';
import { pollutantHandlers } from './pollutants';
import { pollutantCatalogHandlers } from './pollutant-catalog';
import { memberHandlers, roleHandlers } from './member';
import { documentHandlers } from './document';
import { equipmentHandlers } from './equipment';
import { teamHandlers } from './team';
import { scheduleHandlers } from './schedule';

// 마커: [ACTIVE] 개발 중 | [READY] 구현 완료 비활성 | [WIP] 작성 중
export const handlers = [
  // ...authHandlers,
  // ...dashboardHandlers,
  // ...tenantHandlers,
  // ...clientHandlers,
  // ...stackHandlers,
  // ...stackPollutantHandlers,
  // ...contractHandlers,
  // ...pollutantHandlers,
  // ...pollutantCatalogHandlers,
  // ...memberHandlers,
  // ...roleHandlers,
  // ...documentHandlers,
  // ...equipmentHandlers,
  // ...teamHandlers,
  // ...scheduleHandlers,
];