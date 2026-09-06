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

/**
 * 도메인별 목 핸들러 등록부.
 *
 * **주석으로 끄지 않는다.** 예전에는 아래 배열의 spread 를 주석 처리해 도메인을 껐는데, 그러면
 * import 만 남아 `tsc -b` 가 미사용 import 로 막았다(실제로 빌드가 깨져 있었다).
 * 켤 도메인은 {@link ENABLED} 목록으로만 정하고, 등록부는 항상 전부를 참조한다.
 */
const REGISTRY = {
  auth: authHandlers,
  dashboard: dashboardHandlers,
  tenant: tenantHandlers,
  client: clientHandlers,
  stack: stackHandlers,
  stackPollutant: stackPollutantHandlers,
  contract: contractHandlers,
  pollutant: pollutantHandlers,
  pollutantCatalog: pollutantCatalogHandlers,
  member: memberHandlers,
  role: roleHandlers,
  document: documentHandlers,
  equipment: equipmentHandlers,
  team: teamHandlers,
  schedule: scheduleHandlers,
} as const;

/**
 * 목으로 가로챌 도메인. 여기 없는 도메인은 실서버(`vite.config.ts` 의 `/api` 프록시)로 나간다.
 *
 * 목을 아예 쓰지 않으려면 이 배열을 비우는 것이 아니라 `.env` 의 `VITE_ENABLE_MSW` 를 끈다 —
 * 배열이 비어도 워커는 뜨고 모든 요청을 통과시키므로(`onUnhandledRequest: 'bypass'`) 동작은
 * 같지만, 의도가 드러나는 쪽이 환경변수다.
 */
const ENABLED: (keyof typeof REGISTRY)[] = [
  'auth',
  'dashboard',
  'tenant',
  'client',
  'stack',
  'stackPollutant',
  'contract',
  'pollutant',
  'pollutantCatalog',
  'member',
  'role',
  'document',
  'equipment',
  'team',
  'schedule',
];

export const handlers = ENABLED.flatMap((domain) => REGISTRY[domain]);
