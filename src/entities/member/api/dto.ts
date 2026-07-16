export type MemberResponse = {
  id: number;
  username: string;           // 로그인 아이디
  name: string;               // 이름
  roleId: number;             // 역할 ID
  role: string;               // 역할 이름 (ADMIN, LAB, ...)
  department: string;         // 부서
  email: string;              // E-mail
  tel: string;                // 전화번호
  tenantId: number;           // 소속 tenant
}

export type MemberRegisterRequest = {
  roleId: number;
  username: string;
  password: string;
  name: string;
  department: string;
  email: string;
  tel: string;
}

export type MemberUpdateRequest = {
  roleId: number;
  name: string;
  department: string;
  email: string;
  tel: string;
}

export type RoleResponse = {
  roleId: number;
  name: string;               // ADMIN, LAB, FIELD, DOC, USER
  description: string;
}
