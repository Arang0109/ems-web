import { Link } from 'react-router';

import { cn } from '@/lib/utils';
import { Avatar } from '@shared/ui/avatar';
import { Badge } from '@shared/ui/badges';

import type { ChatRoomListRow } from '../../model/types';

interface Props {
  row: ChatRoomListRow;
  isSelected: boolean;
}

export const ChatRoomRow = ({ row, isSelected }: Props) => (
  <li>
    <Link
      to={`/chat/${row.roomId}`}
      aria-current={isSelected ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-nav px-3 py-2.5 text-start transition-colors',
        'motion-reduce:transition-none hover:bg-canvas',
        isSelected && 'bg-brand-soft hover:bg-brand-soft',
      )}
    >
      <Avatar
        name={row.peerName}
        online={row.online}
        statusLabel={row.online ? '온라인' : '오프라인'}
      />

      {/* min-w-0 이 없으면 긴 미리보기가 truncate 되지 않고 행을 밀어낸다 */}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className={cn('truncate text-body-4', isSelected ? 'text-brand-dark' : 'text-ink')}>
            {row.peerName}
          </span>
          {row.department && (
            <span className="shrink-0 truncate text-caption text-muted-ink">{row.department}</span>
          )}
          <span className="ms-auto shrink-0 text-caption text-muted-ink">{row.timeLabel}</span>
        </span>

        <span className="flex items-center gap-2">
          <span className="truncate text-body-3 text-ink-soft">{row.preview}</span>
          {row.unreadCount > 0 && (
            <Badge tone="brand" className="ms-auto shrink-0 tabular-nums">
              {row.unreadCount > 99 ? '99+' : row.unreadCount}
            </Badge>
          )}
        </span>
      </span>
    </Link>
  </li>
);
