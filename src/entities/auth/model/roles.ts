export const USER_ROLES = ["ADMIN", "LAB", "FIELD"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "관리자",
  LAB: "실험실",
  FIELD: "측정팀"
};

/** role 이름을 한글 라벨로 변환 (미정의 role은 원본 문자열 반환) */
export const toRoleLabel = (role: string): string =>
  ROLE_LABELS[role as UserRole] ?? role;

/** 현재 유저가 ADMIN 권한인지 여부 */
export const isAdmin = (role?: string | null): boolean => role === "ADMIN";

/**
 * 플랫폼 운영자 전역 역할 — tenant에 속하지 않는 서비스 운영자(우리).
 * tenant 범위 역할(USER_ROLES)과 별개로 취급한다.
 */
export const PLATFORM_ROLE = "PLATFORM_ADMIN";

/** 현재 유저가 플랫폼 운영자(전역)인지 여부 */
export const isPlatformAdmin = (role?: string | null): boolean => role === PLATFORM_ROLE;
