import { describe, expect, it } from 'vitest';

import { toRegisterRequest, toUpdateRequest } from './mapper';
import type { ContractCreate, ContractUpdate } from '../model/types';

const base = {
  contractName: ' 2026년 정기 대기측정 ',
  // 사용자가 KST 달력에서 고른 날짜 = 로컬 자정
  contractDate: new Date(2026, 8, 26),
  startDate: new Date(2026, 9, 1),
  completionDate: new Date(2026, 11, 31),
  contractAmount: 1000,
  contractAmountUnit: 'WON',
  vatIncluded: true,
  contractGuaranteeAmount: null,
  advancePaymentAmount: null,
  advancePaymentDueDate: 0,
  delayPenaltyRate: 0,
  remark: '',
} as const;

// 서버 필드는 LocalDate 다. Date 를 그대로 JSON 에 실으면 UTC ISO(`2026-09-25T15:00:00.000Z`)가 되어
// Jackson 이 UTC 기준 날짜(하루 전)로 저장한다 — 요청에는 날짜 문자열만 실려야 한다.
describe('계약 요청 날짜 직렬화', () => {
  it('등록 요청은 고른 날짜 그대로 yyyy-MM-dd 로 보낸다', () => {
    const req = toRegisterRequest({ ...base, workplaceId: 1 } as unknown as ContractCreate);
    expect(req.contractDate).toBe('2026-09-26');
    expect(req.startDate).toBe('2026-10-01');
    expect(req.completionDate).toBe('2026-12-31');
    expect(JSON.parse(JSON.stringify(req)).contractDate).toBe('2026-09-26');
  });

  it('수정 요청도 같다', () => {
    const req = toUpdateRequest(base as unknown as ContractUpdate);
    expect(req.contractDate).toBe('2026-09-26');
  });
});
