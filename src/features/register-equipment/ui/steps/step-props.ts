/**
 * 스텝 컴포넌트가 공유하는 레이아웃 상수.
 *
 * 스텝마다 같은 그리드를 문자열로 반복하면 한쪽만 바뀌어 열 수가 어긋난다.
 * (`save-schedule-sheets/ui/sections/shell-props.ts` 와 같은 역할)
 */
export const STEP_GRID_3 = "grid gap-4 m-2 md:m-0 md:grid-cols-3";
export const STEP_GRID_4 = "grid gap-4 m-2 md:m-0 md:grid-cols-4";
