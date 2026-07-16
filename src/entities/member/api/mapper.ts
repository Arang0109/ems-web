import type { MemberRegisterRequest, MemberUpdateRequest } from "./dto";
import type { MemberCreate, MemberUpdate } from "../model/types";

import { unformatNumber, trimValue } from "@shared/lib";

export const toRegisterRequest = (vo: MemberCreate): MemberRegisterRequest => ({
  roleId: vo.roleId,
  username: trimValue(vo.username),
  password: vo.password,
  name: trimValue(vo.name),
  department: trimValue(vo.department),
  email: trimValue(vo.email),
  tel: unformatNumber(vo.tel),
})

export const toUpdateRequest = (vo: MemberUpdate): MemberUpdateRequest => ({
  roleId: vo.roleId,
  name: trimValue(vo.name),
  department: trimValue(vo.department),
  email: trimValue(vo.email),
  tel: unformatNumber(vo.tel),
})
