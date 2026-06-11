import { useState } from 'react';

import type { Facility } from '@entities/stack';
import { RegisterFacilityForm } from '@features/register-facility';
import { UpdateFacilityForm } from '@features/update-facility';

import { Divider } from '@shared/ui/borders';
import { IconButton } from '@shared/ui/buttons';
import { Plus, Pencil } from 'lucide-react';

interface Props {
  stackId: number;
  facilities: Facility[];
  onRefetch: () => void;
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 rounded-xl px-4 py-3">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || '-'}</p>
  </div>
);

export const FacilityInfo = ({ stackId, facilities, onRefetch }: Props) => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const handleEditClick = (facility: Facility) => {
    setSelectedFacility(facility);
    setUpdateOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">배출시설</h3>
        <IconButton
          icon={<Plus size={14} />}
          label="배출시설 추가"
          onClick={() => setRegisterOpen(true)}
        />
      </div>

      {facilities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          등록된 배출시설이 없습니다.
        </p>
      ) : (
        facilities.map((facility, index) => (
          <div key={facility.id} className="space-y-5">
            {index > 0 && <Divider />}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500">시설 정보</p>
                <IconButton
                  icon={<Pencil size={12} />}
                  label="수정"
                  size="xs"
                  onClick={() => handleEditClick(facility)}
                />
              </div>
              <InfoItem label="배출시설명" value={facility.name} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">연료 정보</p>
              <div className="grid grid-cols-3 gap-3">
                <InfoItem label="연료 유형" value={facility.fuelType} />
                <InfoItem label="연료 사용량" value={facility.fuelUsage} />
                <InfoItem label="연료 투입량" value={facility.fuelInput} />
              </div>
            </div>
          </div>
        ))
      )}

      <RegisterFacilityForm
        stackId={stackId}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={onRefetch}
      />

      <UpdateFacilityForm
        key={selectedFacility?.id}
        stackId={stackId}
        facility={selectedFacility}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onSuccess={onRefetch}
      />
    </div>
  );
};
