import { useState } from 'react';

import type { Prevention, TargetSubstance } from '@entities/stack';
import { RegisterPreventionForm } from '@features/register-prevention';
import { UpdatePreventionForm } from '@features/update-prevention';
import { RegisterSubstanceForm } from '@features/register-substance';
import { useDeleteSubstance } from '@features/delete-substance';

import { Divider } from '@shared/ui/borders';
import { IconButton } from '@shared/ui/buttons';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Props {
  stackId: number;
  preventions: Prevention[];
  onRefetch: () => void;
}

interface SubstanceItemProps {
  stackId: number;
  preventionId: number;
  substance: TargetSubstance;
  onRefetch: () => void;
}

const SubstanceItem = ({ stackId, preventionId, substance, onRefetch }: SubstanceItemProps) => {
  const { isLoading, handleDelete } = useDeleteSubstance({
    stackId,
    preventionId,
    substance,
    onSuccess: onRefetch,
  });

  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{substance.name}</p>
        <p className="text-sm font-medium text-gray-800">{substance.removalEfficiency || '-'}</p>
      </div>
      <IconButton
        icon={<Trash2 size={12} />}
        label="삭제"
        size="xs"
        variant="destructive"
        onClick={handleDelete}
        disabled={isLoading}
      />
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 rounded-xl px-4 py-3">
    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || '-'}</p>
  </div>
);

export const PreventionInfo = ({ stackId, preventions, onRefetch }: Props) => {
  const [registerPreventionOpen, setRegisterPreventionOpen] = useState(false);
  const [updatePreventionOpen, setUpdatePreventionOpen] = useState(false);
  const [selectedPrevention, setSelectedPrevention] = useState<Prevention | null>(null);
  const [registerSubstanceOpen, setRegisterSubstanceOpen] = useState(false);
  const [registerSubstancePreventionId, setRegisterSubstancePreventionId] = useState<number | null>(null);

  const handleEditClick = (prevention: Prevention) => {
    setSelectedPrevention(prevention);
    setUpdatePreventionOpen(true);
  };

  const handleAddSubstanceClick = (preventionId: number) => {
    setRegisterSubstancePreventionId(preventionId);
    setRegisterSubstanceOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">방지시설</h3>
        <IconButton
          icon={<Plus size={14} />}
          label="방지시설 추가"
          onClick={() => setRegisterPreventionOpen(true)}
        />
      </div>

      {preventions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          등록된 방지시설이 없습니다.
        </p>
      ) : (
        preventions.map((prevention, index) => (
          <div key={prevention.id} className="space-y-5">
            {index > 0 && <Divider />}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500">시설 정보</p>
                <IconButton
                  icon={<Pencil size={12} />}
                  label="수정"
                  size="xs"
                  onClick={() => handleEditClick(prevention)}
                />
              </div>
              <InfoItem label="방지시설명" value={prevention.name} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500">대상 물질</p>
                <IconButton
                  icon={<Plus size={12} />}
                  label="대상물질 추가"
                  size="xs"
                  onClick={() => handleAddSubstanceClick(prevention.id)}
                />
              </div>
              {prevention.targets.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {prevention.targets.map((target) => (
                    <SubstanceItem
                      key={target.id}
                      stackId={stackId}
                      preventionId={prevention.id}
                      substance={target}
                      onRefetch={onRefetch}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-2">등록된 대상물질이 없습니다.</p>
              )}
            </div>
          </div>
        ))
      )}

      <RegisterPreventionForm
        stackId={stackId}
        open={registerPreventionOpen}
        onOpenChange={setRegisterPreventionOpen}
        onSuccess={onRefetch}
      />

      <UpdatePreventionForm
        key={selectedPrevention?.id}
        stackId={stackId}
        prevention={selectedPrevention}
        open={updatePreventionOpen}
        onOpenChange={setUpdatePreventionOpen}
        onSuccess={onRefetch}
      />

      {registerSubstancePreventionId !== null && (
        <RegisterSubstanceForm
          key={registerSubstancePreventionId}
          stackId={stackId}
          preventionId={registerSubstancePreventionId}
          open={registerSubstanceOpen}
          onOpenChange={setRegisterSubstanceOpen}
          onSuccess={onRefetch}
        />
      )}
    </div>
  );
};
