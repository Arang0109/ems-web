import { useState } from "react";
import { Plus, SquarePen } from "lucide-react";

import type { Facility } from "@entities/stack";
import { RegisterFacilityForm } from "@features/register-facility";
import { UpdateFacilityForm } from "@features/update-facility";
import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";
import { IconButton } from "@shared/ui/buttons";
import { EmptyText } from "@shared/ui/feedback";
import { DetailGrid, DetailRow } from "@shared/ui/form";
import { useRemountKey } from "@shared/model";

import { value } from "../../model/mapper";

interface Props {
  stackId: number;
  facilities: Facility[];
  onRefetch: () => void;
}

export const FacilityInfo = ({ stackId, facilities, onRefetch }: Props) => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const handleEditClick = (facility: Facility) => {
    setSelectedFacility(facility);
    setUpdateOpen(true);
  };

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerOpen);
  const updateFormKey = useRemountKey(updateOpen);

  return (
    // 추가 트리거가 헤더(접어도 보임)에 있으므로 폼은 아코디언 본문 밖에 둔다
    <>
      <SectionAccordion
        title="배출시설"
        subtitle={<span className="text-body-4 text-brand-dark">{facilities.length}개</span>}
        defaultOpen
        action={
          <IconButton
            icon={<Plus size={19} />}
            label="배출시설 추가"
            variant="ghost"
            size="icon-sm"
            onClick={() => setRegisterOpen(true)}
          />
        }
      >
        {/* 시설이 없어도 추가 버튼은 헤더에 있으므로 조기 반환하지 않는다 */}
        {facilities.length === 0 ? (
          <EmptyText>등록된 배출시설이 없습니다.</EmptyText>
        ) : (
          facilities.map((facility) => (
            <SubAccordion
              key={facility.id}
              title={facility.name.trim() || "(이름 없음)"}
              defaultOpen
              action={
                <IconButton
                  icon={<SquarePen size={16} />}
                  label={`${facility.name} 수정`}
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleEditClick(facility)}
                />
              }
            >
              {/* 배출시설명은 SubAccordion 제목이 이미 보여주므로 행으로 반복하지 않는다 */}
              <DetailGrid cols={3}>
                <DetailRow label="연료 사용량" value={value(facility.fuelUsage)} />
                <DetailRow label="제품 생산량" value={value(facility.productOutput)} />
                <DetailRow label="소각량" value={value(facility.incinerationAmount)} />
                <DetailRow label="원료 투입량" value={value(facility.fuelInput)} />
                <DetailRow label="종류" value={value(facility.fuelType)} />
                <DetailRow label="단위" value={value(facility.unit)} />
              </DetailGrid>
            </SubAccordion>
          ))
        )}
      </SectionAccordion>

      <RegisterFacilityForm
        key={registerFormKey}
        stackId={stackId}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={onRefetch}
      />

      <UpdateFacilityForm
        key={updateFormKey}
        facility={selectedFacility}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onSuccess={onRefetch}
      />
    </>
  );
};
