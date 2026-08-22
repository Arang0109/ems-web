import type { MemberRegisterRequest, MemberUpdateRequest } from "./dto";
import type { MemberCreate, MemberUpdate } from "../model/types";


export const toRegisterRequest = (vo: MemberCreate): MemberRegisterRequest => ({
  roleId: vo.roleId,
  username: vo.username,
  password: vo.password,
  name: vo.name,
  department: vo.department,
  email: vo.email,
  tel: vo.tel,
})

export const toUpdateRequest = (vo: MemberUpdate): MemberUpdateRequest => ({
  roleId: vo.roleId,
  name: vo.name,
  department: vo.department,
  email: vo.email,
  tel: vo.tel,
})
