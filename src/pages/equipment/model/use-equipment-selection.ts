import { useState } from 'react';

import { useEquipmentDetail } from '@entities/equipment';

export const useEquipmentSelection = () => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  const { data: selectedEquipment } = useEquipmentDetail({
    id: selectedEquipmentId,
  });

  const handleSelectEquipmentRow = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
  };

  return {
    selectedEquipment,

    handleSelectEquipmentRow,
  };
};
