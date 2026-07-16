import { authHandlers } from './auth';
import { dashboardHandlers } from './dashboard';
import { clientHandlers } from './client';
import { stackHandlers } from './stack';
import { stackPollutantHandlers } from './stack-pollutant';
import { contractHandlers } from './contract';
import { pollutantHandlers } from './pollutants';
import { memberHandlers, roleHandlers } from './member';
import { equipmentHandlers } from './equipment';
import { teamHandlers } from './team';
import { scheduleHandlers } from './schedule';

// 마커: [ACTIVE] 개발 중 | [READY] 구현 완료 비활성 | [WIP] 작성 중
export const handlers = [
  // [ACTIVE]   관리자 페이지 개발용 (role 포함 로그인)
  ...authHandlers,

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

  // [ACTIVE]   측정장비 관리
  ...equipmentHandlers,

  // [ACTIVE]   팀 관리 + 측정계획 등록 연쇄 select용
  ...teamHandlers,

  // [ACTIVE]   측정계획 관리
  ...scheduleHandlers,
];
