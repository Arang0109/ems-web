/** 스텝 위저드 모달의 한 단계 */
export interface DialogStep {
  id: string;
  label: string;
  content: React.ReactNode;
  /** StepNav 배지 — 이 스텝을 통과하려면 남은 필수 입력. total 0 이면 표시하지 않는다 */
  progress?: { done: number; total: number };
  /**
   * '다음' 클릭 시 이 스텝만 검증한다. `false` 를 반환하면 이동하지 않는다.
   *
   * 에러 상태 반영(`setFieldErrors` 등)은 호출자가 이 함수 안에서 직접 한다 —
   * shared 는 features 의 에러맵 형태를 알지 않는다.
   */
  validate?: () => boolean;
}
