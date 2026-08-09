// 아래 도메인 핸들러는 필요 시 import와 spread를 함께 해제한다.
import { authHandlers } from './auth';
import { tenantHandlers } from './tenant';
import { dashboardHandlers } from './dashboard';
import { clientHandlers } from './client';
import { stackHandlers } from './stack';
import { stackPollutantHandlers } from './stack-pollutant';
import { contractHandlers } from './contract';
import { pollutantHandlers } from './pollutants';
import { memberHandlers, roleHandlers } from './member';
import { documentHandlers } from './document';
import { equipmentHandlers } from './equipment';
import { teamHandlers } from './team';
import { scheduleHandlers } from './schedule';

// 마커: [ACTIVE] 개발 중 | [READY] 구현 완료 비활성 | [WIP] 작성 중
export const handlers = [
  // [ACTIVE]   로그인(role 포함) — 관리자/플랫폼 운영자 콘솔 접근용
  ...authHandlers,

  // [ACTIVE]   플랫폼 운영자 콘솔 — 고객사 발급/조회
  ...tenantHandlers,

  // [ACTIVE]
  ...dashboardHandlers,

  // [ACTIVE]   측정계획 등록 연쇄 select용 (거래처·사업장)
  ...clientHandlers,

  // [ACTIVE]   측정계획 등록 연쇄 select용 (측정시설)
  ...stackHandlers,

  // [ACTIVE]
  ...stackPollutantHandlers,

  // [READY]
  ...contractHandlers,

  // [ACTIVE]
  ...pollutantHandlers,

  // [ACTIVE]   회원 관리(관리자 페이지) + 팀 사수·부사수 조회
  ...memberHandlers,
  ...roleHandlers,

  // [ACTIVE]   문서 관리(관리자 페이지) — 버전 관리·업로드/다운로드
  ...documentHandlers,

  // [ACTIVE]   측정장비 관리
  ...equipmentHandlers,

  // [ACTIVE]   팀 관리 + 측정계획 등록 연쇄 select용
  ...teamHandlers,

  // [ACTIVE]   측정계획 관리
  ...scheduleHandlers,
];
