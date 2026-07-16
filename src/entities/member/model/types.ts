import type { MemberResponse, RoleResponse } from "../api/dto";

export type Member = MemberResponse

export type Role = RoleResponse

export type MemberCreate = {
  roleId: number;
  username: string;
  password: string;
  name: string;
  department: string;
  email: string;
  tel: string;
}

export type MemberUpdate = {
  roleId: number;
  name: string;
  department: string;
  email: string;
  tel: string;
}
