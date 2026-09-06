/**
 * 모달 셸의 크기 규약.
 *
 * `FormDialog` 와 `StepFormDialog` 가 공유하므로 `FormDialogShell` 옆에 둔다.
 * (디자인 시스템에 모달 폭 토큰이 아직 없어 여기가 사실상의 단일 소스다.)
 */

/**
 * 모달 너비 프리셋.
 *
 * **폭 상한을 `min(프리셋, calc(100% - 2rem))` 으로 묶는 것이 규약이다.**
 * `DialogContent` 기본값에 이미 `max-w-[calc(100%-2rem)]`(좌우 1rem 여백)이 있지만,
 * 여기서 주는 `sm:` 변형이 같은 속성을 더 뒤에서 덮어써 640px 이상에서 그 여백이 사라진다.
 * 프리셋보다 좁은 화면(예: 768px 뷰포트 + `xl`)에서 모달이 화면 끝까지 붙던 원인이라,
 * 프리셋 자체가 여백을 품게 했다.
 */
export const SIZE_CLASS = {
  default: "sm:max-w-[min(37.5rem,calc(100%-2rem))]",  // 600px
  lg: "sm:max-w-[min(48rem,calc(100%-2rem))]",         // 768px
  xl: "sm:max-w-[min(64rem,calc(100%-2rem))]",         // 1024px
} as const;

export type DialogSize = keyof typeof SIZE_CLASS;

/**
 * 모바일 전체화면 — `DialogContent` 의 기본 클래스를 **치환**한다.
 *
 * 기본값이 `fixed top-1/2 left-1/2 -translate-*-1/2 rounded-xl p-6 gap-6 max-w-* sm:max-w-md`
 * 이므로 위치·모서리·여백·최대폭을 전부 되돌린다. `sm:max-w-none` 이 필요한 이유는
 * 기본값의 `sm:max-w-md` 가 다른 variant 라 `max-w-none` 만으로는 지워지지 않아서다
 * (sm~md 구간, 640~767px 에서 되살아난다).
 *
 * 폭은 `w-screen`(=`100vw`)이 아니라 **`w-full`** 이다. `vw` 는 클래식 스크롤바를 **포함**하는데
 * `position: fixed` 의 컨테이닝 블록(ICB)은 스크롤바를 **제외**한다. `index.css` 가
 * `html { overflow-y: scroll }` 로 스크롤바를 상시 노출하므로, `100vw` 를 쓰면 모달이 ICB 보다
 * 스크롤바 폭만큼 넓어져 오른쪽이 잘린다(= 좌우 비대칭). `w-full` 은 `inset-0` 과 같은 폭이다.
 */
export const MOBILE_FULLSCREEN_CLASS =
  "inset-0 h-dvh w-full max-h-none max-w-none sm:max-w-none " +
  "translate-x-0 translate-y-0 rounded-none p-0 gap-0";
