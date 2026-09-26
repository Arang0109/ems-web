import type { ScheduleStatus } from '@shared/model';
import type { StatusTone } from '@shared/ui/badges';

/*
 * 측정계획 상태 규칙 — 서버 `ScheduleStatus` 의 판정을 옮긴 업무 규칙이라 shared 가 아니라 이 슬라이스가 갖는다.
 * (shared 에 남는 것은 상태 enum·라벨뿐이다.)
 */

/**
 * 측정계획 상태에서 넘어갈 수 있는 다음 상태. 서버 `ScheduleStatus.canTransitionTo()` 와 같은 규칙으로,
 * 단계 건너뛰기와 되돌리기를 허용하지 않는다. 성적서작성완료·취소는 종단 상태다.
 *
 * 업무 단계는 측정예정 → 측정중 → 인계완료 → 분석값입력중 → 분석완료 → 성적서작성완료 6단계지만,
 * 인계완료와 분석값입력중이 같은 시점이고 분석완료와 성적서작성완료도 같은 시점이라
 * 각각 하나로 합쳐 `ANALYZING`·`REPORT_COMPLETED` 로 표현한다.
 *
 * 전진(측정중·분석값입력중)은 채취 시작시각·실측값 입력, 시료접수일 입력 시 서버가 자동으로 처리하므로,
 * 화면이 실제로 노출하는 것은 사용자가 확정하는 종료 전이(성적서작성완료·취소)뿐이다.
 * 최종 판정은 서버가 하며, 여기서는 액션 노출 여부만 판단한다.
 *
 * 종단 상태의 재개방은 이 표가 아니라 `canReopenSchedule` 이 판정한다 — 예외 경로이므로
 * 일반 전이에 섞지 않는다(서버 `ScheduleStatus.canReopen()` 과 동일한 분리).
 */
export const SCHEDULE_STATUS_TRANSITIONS: Record<ScheduleStatus, readonly ScheduleStatus[]> = {
  SCHEDULED: ['MEASURING', 'CANCELED'],
  MEASURING: ['ANALYZING', 'CANCELED'],
  ANALYZING: ['REPORT_COMPLETED', 'CANCELED'],
  REPORT_COMPLETED: [],
  CANCELED: [],
};

export const canTransitionScheduleStatus = (from: ScheduleStatus, to: ScheduleStatus): boolean =>
  SCHEDULE_STATUS_TRANSITIONS[from].includes(to);

/** 더 이상 전진하지 않는 종단 상태인지 여부. 서버 `ScheduleStatus.isTerminal()` 과 같은 규칙이다. */
export const isTerminalScheduleStatus = (status: ScheduleStatus): boolean =>
  status === 'REPORT_COMPLETED' || status === 'CANCELED';

/**
 * 종단 상태를 되돌려 다시 작업 가능하게 만들 수 있는지 여부. 서버 `ScheduleStatus.canReopen()` 과 같다.
 * 돌아갈 단계는 서버가 저장된 측정 데이터에서 재도출하므로 화면이 정하지 않는다.
 */
export const canReopenSchedule = (status: ScheduleStatus): boolean => isTerminalScheduleStatus(status);

/**
 * 재개방에 관리자 권한이 필요한 상태인지 여부. 서버 `ScheduleStatus.requiresAdminToReopen()` 과 같다.
 *
 * 성적서작성완료는 대외 확정이라 관리자만 되돌린다.
 * 취소는 실수로 걸면 이미 입력한 측정 데이터가 잠기므로 담당자가 즉시 되돌릴 수 있어야 한다.
 */
export const requiresAdminToReopenSchedule = (status: ScheduleStatus): boolean =>
  status === 'REPORT_COMPLETED';

/**
 * 측정계획을 삭제(감춤)할 수 있는지 여부. 서버 `ScheduleStatus.canDelete()` 와 같은 규칙이다.
 *
 * 삭제는 "애초에 잘못 등록됨"을 목록에서 감추는 조작이다. 성적서가 나가기 전(측정예정·측정중·분석값입력중)이면
 * 취소를 거치지 않고 바로 감출 수 있다. '취소'도 감출 수 있는데, 취소 건에는 사유를 남겨 둬야 할 것과
 * 잘못 만들어져 지워야 할 것이 섞여 있어 취소 목록에서 골라내야 하기 때문이다.
 * 성적서작성완료는 발행된 결과가 있어 삭제할 수 없다.
 */
export const canDeleteSchedule = (status: ScheduleStatus): boolean =>
  status === 'SCHEDULED' || status === 'MEASURING' || status === 'ANALYZING' || status === 'CANCELED';

/**
 * 측정계획 상태의 표시 톤. 목록 배지·모바일 칩·상세 헤더가 공유한다.
 *
 * 네 진행 단계에 각각 다른 색을 준다 — 회색(대기) → 앰버(현장) → 파랑(실험실) → 초록(확정).
 * 진행 단계가 여럿이라 "진행 중"을 한 색으로 묶으면 목록에서 어느 단계인지 색으로 읽히지 않고,
 * 라벨을 끝까지 읽어야만 구분된다.
 *
 * 색상만으로 구분하지 않는다는 원칙은 그대로다 — `StatusDot` 이 점과 라벨을 항상 함께 그린다.
 */
export const SCHEDULE_STATUS_TONE: Record<ScheduleStatus, StatusTone> = {
  SCHEDULED: 'pending',           // 회색 — 아직 시작 전
  MEASURING: 'active',            // 앰버 — 현장 측정 진행
  ANALYZING: 'info',              // 파랑 — 실험실 분석값 입력 진행
  REPORT_COMPLETED: 'success',    // 초록 — 성적서까지 끝남
  CANCELED: 'danger',             // 빨강 — 중단
};
