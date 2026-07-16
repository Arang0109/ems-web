import type { MemberRegisterForm } from "./types";
import type { MemberCreate } from "@entities/member";

import { unformatNumber, trimValue } from "@shared/lib";

export const toMemberCreate = (
  form: MemberRegisterForm
): MemberCreate => ({
  roleId: Number(form.roleId),
  username: trimValue(form.username),
  password: form.password,
  name: trimValue(form.name),
  department: trimValue(form.department),
  email: trimValue(form.email),
  tel: unformatNumber(form.tel),
});
