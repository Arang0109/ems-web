import type { ActiveStatus } from "@shared/model";
import { ACTIVE_STATUSES } from "@shared/model";

interface TableToolbarProps {
  statusFilter: ActiveStatus;
  setStatusFilter: (value: React.SetStateAction<ActiveStatus>) => void;
}

export const TableToolbar = ({ statusFilter, setStatusFilter }: TableToolbarProps) => {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 text-sm font-medium">
      {(ACTIVE_STATUSES).map((v) => (
        <button
          key={v}
          onClick={() => setStatusFilter(v)}
          className={`rounded-md px-3 py-1 transition-colors ${
            statusFilter === v
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {v === 'active' ? '활성' : '비활성'}
        </button>
      ))}
    </div>
  );
}