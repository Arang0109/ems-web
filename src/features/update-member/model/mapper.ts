import type { MemberUpdateForm } from "./types";
import type { MemberUpdate } from "@entities/member";

import { unformatNumber, trimValue } from "@shared/lib";

export const toMemberUpdate = (
  form: MemberUpdateForm
): MemberUpdate => ({
  roleId: Number(form.roleId),
  name: trimValue(form.name),
  department: trimValue(form.department),
  email: trimValue(form.email),
  tel: unformatNumber(form.tel),
});
