import type { Member } from '@entities/member';
import { toRoleLabel } from '@entities/auth';
import { formatPhoneNumber } from '@shared/lib';

import type { MemberTableRow } from './types';

export const toMemberRows = (col: Member): MemberTableRow => ({
  id: col.id,
  username: col.username,
  name: col.name,
  role: toRoleLabel(col.role),
  department: col.department,
  email: col.email,
  tel: formatPhoneNumber(col.tel),
});
