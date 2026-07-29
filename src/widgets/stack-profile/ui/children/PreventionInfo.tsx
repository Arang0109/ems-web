import { useState } from 'react';

import type { Prevention } from '@entities/stack';
import { RegisterPreventionForm } from '@features/register-prevention';
import { UpdatePreventionForm } from '@features/update-prevention';

import { Divider } from '@shared/ui/borders';
import { IconButton } from '@shared/ui/buttons';
import { Plus, Pencil } from 'lucide-react';

interface Props {
  stackId: number;
  preventions: Prevention[];
  onRefetch: () => void;
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded-xl px-4 py-3">
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{value || '-'}</p>
  </div>
);

export const PreventionInfo = ({ stackId, preventions, onRefetch }: Props) => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedPrevention, setSelectedPrevention] = useState<Prevention | null>(null);

  const handleEditClick = (prevention: Prevention) => {
    setSelectedPrevention(prevention);
    setUpdateOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">방지시설</h3>
        <IconButton
          icon={<Plus size={14} />}
          label="방지시설 추가"
          onClick={() => setRegisterOpen(true)}
        />
      </div>

      {preventions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          등록된 방지시설이 없습니다.
        </p>
      ) : (
        preventions.map((prevention, index) => (
          <div key={prevention.id} className="space-y-5">
            {index > 0 && <Divider />}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">시설 정보</p>
                <IconButton
                  icon={<Pencil size={12} />}
                  label="수정"
                  size="xs"
                  onClick={() => handleEditClick(prevention)}
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <InfoItem label="방지시설명" value={prevention.name} />
                <InfoItem
                  label="용량"
                  value={prevention.capacity != null ? String(prevention.capacity) : ''}
                />
                <InfoItem label="대상물질명" value={prevention.targetName} />
                <InfoItem label="제거 효율" value={prevention.removalEfficiency} />
              </div>
            </div>
          </div>
        ))
      )}

      <RegisterPreventionForm
        stackId={stackId}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={onRefetch}
      />

      <UpdatePreventionForm
        key={selectedPrevention?.id}
        prevention={selectedPrevention}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onSuccess={onRefetch}
      />
    </div>
  );
};
