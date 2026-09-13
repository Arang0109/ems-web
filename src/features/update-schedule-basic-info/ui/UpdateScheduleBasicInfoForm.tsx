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
      title="측정계획 사전 정보"
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel="닫기"
      submitLabel="저장"
      isLoading={isLoading}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <InputGroup
          id="schedule-reference-number"
          label="관리 번호 (문서 번호)"
          placeholder="예) 01-001-01"
          value={form.referenceNumber}
          onChange={(value) => handleChange("referenceNumber", value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            required
            placeholder="용도 선택"
            options={measurementTypeOptions}
            value={form.measurementType}
            onValueChange={(value) => handleChange("measurementType", value ?? "")}
          />
        </div>
        
      </FieldGroup>
    </FormDialog>
  );
};
