import { useState } from "react";

import type { Stack } from "@entities/stack";
import { UpdateStackForm } from "@features/update-stack";

import type { StackProfile } from "../../model/types";

import { Divider } from "@shared/ui/borders";
import { IconButton } from "@shared/ui/buttons";
import { Pencil } from "lucide-react";

interface Props {
  stack: Stack | null;
  stackProfile: StackProfile;
  onSuccess?: () => void;
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/40 rounded-icon-tile px-4 py-3">
    <p className="text-caption text-muted-foreground mb-0.5">{label}</p>
    <p className="text-body-4 text-foreground">{value}</p>
  </div>
);

export const StackBasicInfo = ({ stack, stackProfile, onSuccess }: Props) => {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-h3 text-foreground">기본 정보</h3>
        <IconButton icon={<Pencil size={14} />} onClick={() => setUpdateModalOpen(true)} />
      </div>

      <div className="space-y-2">
        <p className="text-label text-muted-foreground">시설 식별</p>
        <div className="grid grid-cols-3 gap-3">
          <InfoItem label="측정 분야" value={stackProfile.field} />
          <InfoItem label="SEMS 번호" value={stackProfile.semsNumber} />
          <InfoItem label="등급" value={stackProfile.grade} />
        </div>
        <div className="grid grid-cols-3 gap-3">
            <InfoItem label="측정시설명" value={stackProfile.name} />
            <InfoItem label="업종 분류" value={stackProfile.businessCategory} />
            <InfoItem label="주요 생산품" value={stackProfile.mainProduct} />
          </div>
      </div>

      <Divider />

      <div className="space-y-2">
        <p className="text-label text-muted-foreground">구조 정보</p>
        <div className="grid grid-cols-2 gap-3">
          <InfoItem label="방향" value={stackProfile.orientation} />
          <InfoItem label="형태" value={stackProfile.shape} />
          <InfoItem
            label="높이"
            value={stackProfile.height !== "-" ? `${stackProfile.height} m` : "-"}
          />
          <InfoItem label="지름 / 크기" value={stackProfile.diameter} />
        </div>
      </div>
      <UpdateStackForm
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        stack={stack}
        onSuccess={onSuccess}
      />
    </div>
  );
};
