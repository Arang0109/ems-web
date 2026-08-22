/**
 * 모달 셸의 크기 규약.
 *
 * `FormDialog` 와 `StepFormDialog` 가 공유하므로 `FormDialogShell` 옆에 둔다.
 * (디자인 시스템에 모달 폭 토큰이 아직 없어 여기가 사실상의 단일 소스다.)
 */

// 모달 너비 프리셋
export const SIZE_CLASS = {
  default: "sm:max-w-150",  // 600px
  lg: "sm:max-w-3xl",       // 768px
  xl: "sm:max-w-5xl",       // 1024px
} as const;

export type DialogSize = keyof typeof SIZE_CLASS;

/**
 * 모바일 전체화면 — `DialogContent` 의 기본 클래스를 **치환**한다.
 *
 * 기본값이 `fixed top-1/2 left-1/2 -translate-*-1/2 rounded-xl p-6 gap-6 max-w-* sm:max-w-md`
 * 이므로 위치·모서리·여백·최대폭을 전부 되돌린다. `sm:max-w-none` 이 필요한 이유는
 * 기본값의 `sm:max-w-md` 가 다른 variant 라 `max-w-none` 만으로는 지워지지 않아서다
 * (sm~md 구간, 640~767px 에서 되살아난다).
 */
export const MOBILE_FULLSCREEN_CLASS =
  "inset-0 h-dvh w-screen max-h-none max-w-none sm:max-w-none " +
  "translate-x-0 translate-y-0 rounded-none p-0 gap-0";
