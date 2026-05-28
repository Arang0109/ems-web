import { useRef, useEffect } from 'react';

import type { ContractStatus } from '@shared/model';
import { CONTRACT_STATUS } from '@shared/model';
import { BadgeWithIcon } from '@shared/ui/badges';

import { STATUS_MAP } from '../model/constants';

const FILTER_LABELS: Record<ContractStatus, string> = {
  active: '계약중',
  expiringSoon: '만료예정',
  expired: '만료',
};

interface ContractFilterToolbarProps {
  selectedStatuses: Set<ContractStatus>;
  onChange: (statuses: Set<ContractStatus>) => void;
}

export const ContractFilterToolbar = ({ selectedStatuses, onChange }: ContractFilterToolbarProps) => {
  const allRef = useRef<HTMLInputElement>(null);
  const isAllSelected = CONTRACT_STATUS.every(s => selectedStatuses.has(s));
  const isPartialSelected = !isAllSelected && selectedStatuses.size > 0;

  useEffect(() => {
    if (allRef.current) {
      allRef.current.indeterminate = isPartialSelected;
    }
  }, [isPartialSelected]);

  const handleAllToggle = () => {
    onChange(isAllSelected ? new Set() : new Set(CONTRACT_STATUS));
  };

  const handleStatusToggle = (status: ContractStatus) => {
    const next = new Set(selectedStatuses);
    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }
    onChange(next);
  };

  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-1.5 cursor-pointer select-none">
        <input
          ref={allRef}
          type="checkbox"
          checked={isAllSelected}
          onChange={handleAllToggle}
          className="size-3.5 cursor-pointer accent-blue-600"
        />
        <span className="text-sm font-medium text-gray-600">전체</span>
      </label>

      <div className="w-px h-4 bg-gray-200" />

      {CONTRACT_STATUS.map(status => (
        <label key={status} className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAllSelected || selectedStatuses.has(status)}
            onChange={() => handleStatusToggle(status)}
            className="size-3.5 cursor-pointer accent-blue-600"
          />
          <BadgeWithIcon variant={STATUS_MAP[status].variant} label={FILTER_LABELS[status]} />
        </label>
      ))}
    </div>
  );
};
