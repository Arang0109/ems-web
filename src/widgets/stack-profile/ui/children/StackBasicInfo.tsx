import { useState } from "react";
import { SquarePen } from "lucide-react";

import type { Stack } from "@entities/stack";
import { UpdateStackForm } from "@features/update-stack";
import { SectionAccordion } from "@shared/ui/accordion";
import { IconButton } from "@shared/ui/buttons";
import { DetailGrid, DetailRow } from "@shared/ui/form";
import { useRemountKey } from "@shared/model";

import type { StackProfile } from "../../model/types";

interface Props {
  stack: Stack | null;
  stackProfile: StackProfile;
  onSuccess?: () => void;
}

export const StackBasicInfo = ({ stack, stackProfile, onSuccess }: Props) => {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const updateFormKey = useRemountKey(updateModalOpen);

  return (
    // 수정 트리거가 헤더(접어도 보임)에 있으므로 폼은 아코디언 본문 밖에 둔다
    <>
      <SectionAccordion
        title="측정지점 정보"
        action={
          <IconButton
            icon={<SquarePen size={19} />}
            label="측정지점 정보 수정"
            variant="ghost"
            size="icon-sm"
            onClick={() => setUpdateModalOpen(true)}
          />
        }
      >
        <DetailGrid>
          <DetailRow label="측정지점(굴뚝)" value={stackProfile.name} span={2} />
          <DetailRow label="SEMS 번호" value={stackProfile.semsNumber} />
        </DetailGrid>
        <DetailGrid cols={3}>
          <DetailRow label="측정 분야" value={stackProfile.field} />
          <DetailRow label="주요 생산품" value={stackProfile.mainProduct} />
          <DetailRow label="배출시설 종별" value={stackProfile.grade} />
          <DetailRow label="측정공 방향" value={stackProfile.orientation} />
          <DetailRow label="측정공 모양" value={stackProfile.shape} />
          {/* diameter 는 mapper 가 shape 에 따라 단위까지 붙여 만든다 */}
          <DetailRow label="측정공 직경(m)" value={stackProfile.diameter} />
          {/* 단위는 라벨에 둔다 — 값에 붙이면 빈 값("-")에도 단위가 따라붙는다 */}
          <DetailRow label="측정공 높이(m)" value={stackProfile.height} />
          <DetailRow label="표준산소농도(%)" value={stackProfile.standardOxygen} />
        </DetailGrid>
      </SectionAccordion>

      <UpdateStackForm
        key={updateFormKey}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        stack={stack}
        onSuccess={onSuccess}
      />
    </>
  );
};
