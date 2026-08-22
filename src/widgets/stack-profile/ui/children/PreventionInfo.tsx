import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, SquarePen } from "lucide-react";

import type { Prevention } from "@entities/stack";
import { RegisterPreventionForm } from "@features/register-prevention";
import { UpdatePreventionForm, useReorderPreventions } from "@features/update-prevention";
import { formatNumber } from "@shared/lib";
import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";
import { IconButton } from "@shared/ui/buttons";
import { EmptyText } from "@shared/ui/feedback";
import { DetailGrid, DetailRow } from "@shared/ui/form";
import { DragHandle, SortableList, type SortableControls } from "@shared/ui/sortable";
import { useRemountKey } from "@shared/model";

import { value } from "../../model/mapper";

interface Props {
  stackId: number;
  preventions: Prevention[];
  onRefetch: () => void;
}

export const PreventionInfo = ({ stackId, preventions, onRefetch }: Props) => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedPrevention, setSelectedPrevention] = useState<Prevention | null>(null);

  // 순서는 성적서에 어느 시설이 실릴지를 좌우하므로 낙관적으로 즉시 반영하고 바로 저장한다
  const { items, handleReorder } = useReorderPreventions({ stackId, preventions, onRefetch });

  // 하나뿐이면 순위도 순서 조작도 의미가 없다
  const isSortable = items.length > 1;

  const handleEditClick = (prevention: Prevention) => {
    setSelectedPrevention(prevention);
    setUpdateOpen(true);
  };

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerOpen);
  const updateFormKey = useRemountKey(updateOpen);

  const renderCard = (prevention: Prevention, controls: SortableControls | null) => (
    <SubAccordion
      title={prevention.name.trim() || "(이름 없음)"}
      leading={
        controls && (
          <>
            <DragHandle
              handleProps={controls.handleProps}
              label={`${prevention.name} 순서 변경 손잡이`}
            />
            <span className="w-4 text-center text-caption text-ink-soft tabular-nums">
              {controls.index + 1}
            </span>
          </>
        )
      }
      action={
        <>
          {controls && (
            <>
              <IconButton
                icon={<ArrowUp size={16} />}
                label={`${prevention.name} 위로 이동`}
                variant="ghost"
                size="icon-sm"
                disabled={controls.isFirst}
                onClick={controls.moveUp}
              />
              <IconButton
                icon={<ArrowDown size={16} />}
                label={`${prevention.name} 아래로 이동`}
                variant="ghost"
                size="icon-sm"
                disabled={controls.isLast}
                onClick={controls.moveDown}
              />
            </>
          )}
          <IconButton
            icon={<SquarePen size={16} />}
            label={`${prevention.name} 수정`}
            variant="ghost"
            size="icon-sm"
            onClick={() => handleEditClick(prevention)}
          />
        </>
      }
    >
      {/* 방지시설명은 SubAccordion 제목이 이미 보여주므로 행으로 반복하지 않는다 */}
      <DetailGrid>
        {/* capacity 는 number | null — toFormValue 로 되돌려야 null 이 "null" 이 되지 않는다 */}
        <DetailRow label="대상물질" value={value(prevention.targetName)} />
        <DetailRow label="용량" value={`${value(formatNumber(prevention.capacity))} ${value(prevention.unit)}`} />
        <DetailRow label="제거 효율" value={value(prevention.removalEfficiency)} />
      </DetailGrid>
    </SubAccordion>
  );

  return (
    // 추가 트리거가 헤더(접어도 보임)에 있으므로 폼은 아코디언 본문 밖에 둔다
    <>
      <SectionAccordion
        title="방지시설"
        subtitle={<span className="text-body-4 text-brand-dark">{items.length}개</span>}
        defaultOpen
        action={
          <IconButton
            icon={<Plus size={19} />}
            label="방지시설 추가"
            variant="ghost"
            size="icon-sm"
            onClick={() => setRegisterOpen(true)}
          />
        }
      >
        {/* 시설이 없어도 추가 버튼은 헤더에 있으므로 조기 반환하지 않는다 */}
        {items.length === 0 ? (
          <EmptyText>등록된 방지시설이 없습니다.</EmptyText>
        ) : isSortable ? (
          <SortableList
            items={items}
            onReorder={handleReorder}
            // 원래 SubAccordion 들이 SectionAccordion 본문의 space-y-4 를 받고 있었다. 목록이
            // 한 덩어리 자식이 되면서 그 간격이 사라지므로 여기서 같은 값으로 유지한다
            className="space-y-4"
            // 카드가 펼쳐진 채로 크므로 드래그 중 미리보기는 제목 줄만 축약해서 띄운다
            renderOverlay={(prevention) => (
              <div className="rounded-icon-tile bg-canvas px-3 py-2.5 text-body-4 text-ink shadow-lg ring-1 ring-rule md:px-4">
                {prevention.name.trim() || "(이름 없음)"}
              </div>
            )}
            renderItem={renderCard}
          />
        ) : (
          items.map((prevention) => (
            <div key={prevention.id}>{renderCard(prevention, null)}</div>
          ))
        )}
      </SectionAccordion>

      <RegisterPreventionForm
        key={`register-${registerFormKey}`}
        stackId={stackId}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={onRefetch}
      />

      <UpdatePreventionForm
        key={`update-${updateFormKey}`}
        prevention={selectedPrevention}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onSuccess={onRefetch}
      />
    </>
  );
};
