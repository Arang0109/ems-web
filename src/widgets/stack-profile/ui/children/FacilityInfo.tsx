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
  <div className="bg-muted/40 rounded-icon-tile px-4 py-3">
    <p className="text-caption text-muted-foreground mb-0.5">{label}</p>
    <p className="text-body-4 text-foreground">{value || '-'}</p>
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
        <h3 className="text-h3 text-foreground">배출시설</h3>
        <IconButton
          icon={<Plus size={14} />}
          label="배출시설 추가"
          onClick={() => setRegisterOpen(true)}
        />
      </div>

      {facilities.length === 0 ? (
        <p className="text-body-2 text-muted-foreground text-center py-8">
          등록된 배출시설이 없습니다.
        </p>
      ) : (
        facilities.map((facility, index) => (
          <div key={facility.id} className="space-y-5">
            {index > 0 && <Divider />}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-label text-muted-foreground">시설 정보</p>
                <IconButton
                  icon={<Pencil size={12} />}
                  label="수정"
                  size="xs"
                  onClick={() => handleEditClick(facility)}
                />
              </div>
              <div className="grid grid-cols-7 gap-3">
                <InfoItem label="배출시설명" value={facility.name} />
                <InfoItem label="제품 생산량" value={facility.productOutput} />
                <InfoItem label="연료 사용량" value={facility.fuelUsage} />
                <InfoItem label="소각량" value={facility.incinerationAmount} />
                <InfoItem label="원료 투입량" value={facility.fuelInput} />
                <InfoItem label="종류" value={facility.fuelType} />
                <InfoItem label="단위" value={facility.unit} />
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
        facility={selectedFacility}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onSuccess={onRefetch}
      />
    </div>
  );
};
