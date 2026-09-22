import { useState } from "react";
import { SquarePen } from "lucide-react";

import type { ScheduleSnapshot } from "@entities/schedule";
import { useScheduleCustomFields } from "@entities/schedule-custom-field";
import { UpdateScheduleCustomFieldsForm } from "@features/update-schedule-custom-fields";
import { displayValue } from "@shared/lib";
import { SectionAccordion } from "@shared/ui/accordion";
import { IconButton } from "@shared/ui/buttons";
import { DetailGrid, DetailRow } from "@shared/ui/form";
import { useRemountKey } from "@shared/model";

interface Props {
  scheduleId: number;
  snapshot: ScheduleSnapshot;
  editable: boolean;
  onRefetch: () => void;
}

/**
 * "추가 항목" 탭 — 고객사가 정의한 커스텀 필드의 이 회차 값.
 *
 * 칸의 집합은 정의(`GET /schedules/custom-fields`)가, 값은 스냅샷(`customFields`)이 갖는다.
 * 정의에서 사라진 키의 옛 값은 보이지 않는다 — 양식이 그 키를 계속 참조하면 출력은 되지만,
 * 이 화면은 "지금 정의된 칸"만 다룬다(다음 저장 때 서버가 정리한다).
 */
export const CustomFieldsInfo = ({ scheduleId, snapshot, editable, onRefetch }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const editFormKey = useRemountKey(editOpen);

  const { data: definitions, isLoading, error } = useScheduleCustomFields();
  const values = snapshot.customFields;

  const editAction = editable && definitions.length > 0 ? (
    <IconButton
      icon={<SquarePen size={19} />}
      label="커스텀 필드 값 수정"
      variant="ghost"
      size="icon-sm"
      onClick={() => setEditOpen(true)}
    />
  ) : undefined;

  return (
    <div className="space-y-4">
      <SectionAccordion
        title="커스텀 필드"
        description="성적서 양식이 ${custom.키} 로 읽는 이 회차의 값입니다."
        action={editAction}
        defaultOpen
      >
        {error ? (
          <p className="py-4 text-center text-body-2 text-danger">{error}</p>
        ) : isLoading && definitions.length === 0 ? (
          <p className="py-4 text-center text-body-2 text-muted-ink">불러오는 중...</p>
        ) : definitions.length === 0 ? (
          <p className="py-4 text-center text-body-2 text-muted-ink">
            정의된 커스텀 필드가 없습니다. 관리자 &gt; 커스텀 필드에서 항목을 정의하면 여기서 값을 입력할 수 있습니다.
          </p>
        ) : (
          <DetailGrid>
            {definitions.map((definition) => (
              <DetailRow
                key={definition.key}
                label={definition.label}
                value={displayValue(values?.[definition.key])}
              />
            ))}
          </DetailGrid>
        )}
      </SectionAccordion>

      <UpdateScheduleCustomFieldsForm
        key={`custom-fields-${editFormKey}`}
        scheduleId={scheduleId}
        definitions={definitions}
        values={values}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onRefetch}
      />
    </div>
  );
};
