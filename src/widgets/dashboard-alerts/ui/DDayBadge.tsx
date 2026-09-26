import { Badge } from '@shared/ui/badges';

import { formatDDay, toDDayTone } from '../model/d-day';

interface Props {
  days: number;
}

/** 잔여일수 배지 — 임박도에 따라 톤이 바뀐다. */
export const DDayBadge = ({ days }: Props) => (
  <Badge className="text-body-4" tone={toDDayTone(days)}>
    {formatDDay(days)}
  </Badge>
);
