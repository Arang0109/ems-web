import { format } from "date-fns";

import type { ScheduleDetail } from "@entities/schedule";
import { FormDialog } from "@shared/ui/dialogs";
import { DatePicker, FieldGroup, InputGroup, Select } from "@shared/ui/form";
import { measurementTypeOptions } from "@shared/model";

import { useUpdateScheduleBasicInfo } from "../model/hooks/use-update-schedule-basic-info";

interface Props {
  scheduleId: number;
  /** 이 회차의 계획 메타 — 폼의 초기값 */
  schedule: ScheduleDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// sampledAt 은 LocalDate("yyyy-MM-dd") 이므로 시간대 해석 없이 DatePicker 와 주고받는다.
const toDate = (value: string): Date | undefined => (value ? new Date(value) : undefined);
const toDateValue = (date: Date | undefined): string => (date ? format(date, "yyyy-MM-dd") : "");

export const UpdateScheduleBasicInfoForm = ({
  scheduleId, schedule, open, onOpenChange, onSuccess,
}: Props) => {
  const { form, fieldErrors, isLoading, handleChange, handleSubmit } = useUpdateScheduleBasicInfo({
    scheduleId,
    schedule,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      title="사전 정보 수정"
      description="이 측정계획의 관리번호와 측정일자, 측정용도를 바로잡습니다. 측정분야와 측정팀은 계획을 세울 때 정해지므로 여기서 바꿀 수 없습니다."
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel="취소"
      submitLabel="수정"
      isLoading={isLoading}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <InputGroup
          id="schedule-reference-number"
          label="관리번호"
          placeholder="예) KGAR-26-01-001"
          value={form.referenceNumber}
          onChange={(value) => handleChange("referenceNumber", value)}
          helperText="비워 두고 저장하면 기존 관리번호가 지워집니다."
        />

        <DatePicker
          id="schedule-measure-date"
          label="측정일자"
          required
          value={toDate(form.measureDate)}
          onChange={(date) => handleChange("measureDate", toDateValue(date))}
          helperText={fieldErrors?.measureDate}
        />

        <Select
          id="schedule-measurement-type"
          label="측정용도"
          placeholder="용도 선택"
          options={measurementTypeOptions}
          value={form.measurementType}
          onValueChange={(value) => handleChange("measurementType", value ?? "")}
        />
      </FieldGroup>
    </FormDialog>
  );
};
