import { authHandlers, userHandlers } from './auth';
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
import { chatHandlers } from './chat';

/**
 * 도메인별 목 핸들러 등록부.
 *
 * **주석으로 끄지 않는다.** 예전에는 아래 배열의 spread 를 주석 처리해 도메인을 껐는데, 그러면
 * import 만 남아 `tsc -b` 가 미사용 import 로 막았다(실제로 빌드가 깨져 있었다).
 * 켤 도메인은 {@link ENABLED} 목록으로만 정하고, 등록부는 항상 전부를 참조한다.
 */
const REGISTRY = {
  auth: authHandlers,
  user: userHandlers,
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
  chat: chatHandlers,
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
  'user',
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
  // 채팅 — 목록·페이징·전송·첨부까지는 목으로 확인된다. 다만 **실시간은 재현되지 않는다** —
  // MSW 가 이 설정으로 WebSocket 을 가로채지 않기 때문이다. 상대방발 메시지·읽음·접속 상태를
  // 확인할 때는 이 줄을 빼고 `VITE_ENABLE_MSW=false` 로 실서버에 붙는다.
  'chat',
];

export const handlers = ENABLED.flatMap((domain) => REGISTRY[domain]);
