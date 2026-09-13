import { Hash, Building2, User2Icon } from "lucide-react";

import type { ClientSnapshot } from "@entities/schedule";
import { gradeOptions } from "@shared/model";
import type { Grade } from "@shared/model";
import { formatBusinessNumber, unformatNumber } from "@shared/lib";
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, InputGroup, Select, AddressInput } from "@shared/ui/form";

import { useUpdateScheduleClient } from "../model/hooks/use-update-schedule-client";

interface Props {
  scheduleId: number;
  client: ClientSnapshot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UpdateScheduleClientForm = ({
  scheduleId, client, open, onOpenChange, onSuccess,
}: Props) => {
  const {
    form, fieldErrors, isLoading, handleChange,
    handleClientAddressChange, handleWorkplaceAddressChange, handleSubmit,
  } = useUpdateScheduleClient({
    scheduleId,
    client,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      title="의뢰기관 정보"
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel="닫기"
      submitLabel="저장"
      isLoading={isLoading}
      size="lg"
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <InputGroup
          id="name"
          label="측정대행 의뢰기관"
          placeholder="측정대행 의뢰기관"
          value={form.name}
          onChange={(value) => handleChange("name", value)}
          invalid={!!fieldErrors?.name}
          error={fieldErrors?.name}
          startIcon={<Building2 />}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="bizNumber"
            label="사업자등록번호"
            placeholder="사업자등록번호"
            value={formatBusinessNumber(form.bizNumber)}
            onChange={(value) => handleChange("bizNumber", unformatNumber(value).slice(0, 10))}
            invalid={!!fieldErrors?.bizNumber}
            error={fieldErrors?.bizNumber}
            startIcon={<Hash />}
          />
          <InputGroup
            id="representative"
            label="대표자"
            placeholder="대표자"
            value={form.representative}
            onChange={(value) => handleChange("representative", value)}
            startIcon={<User2Icon />}
          />
        </div>

        <AddressInput
          id="clientAddress"
          placeholder="상세주소"
          value={{
            zipcode: form.zipcode,
            roadAddress: form.roadAddress,
            detailAddress: form.detailAddress,
          }}
          onChange={handleClientAddressChange}
        />
        <Divider />

        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="workplaceName"
            label="측정대상 사업장"
            placeholder="측정대상 사업장"
            value={form.workplaceName}
            onChange={(value) => handleChange("workplaceName", value)}
            invalid={!!fieldErrors?.workplaceName}
            error={fieldErrors?.workplaceName}
            startIcon={<Building2 />}
          />
          <InputGroup
            id="workplaceBizNumber"
            label="사업자등록번호"
            placeholder="사업자등록번호"
            value={formatBusinessNumber(form.workplaceBizNumber)}
            onChange={(value) =>
              handleChange("workplaceBizNumber", unformatNumber(value).slice(0, 10))}
            invalid={!!fieldErrors?.workplaceBizNumber}
            error={fieldErrors?.workplaceBizNumber}
            startIcon={<Hash />}
          />
          <Select
            id="workplaceGrade"
            label="사업장 종별"
            placeholder="종별 선택"
            options={gradeOptions}
            value={form.workplaceGrade}
            onValueChange={(value) => value && handleChange("workplaceGrade", value as Grade)}
          />
          <InputGroup
            id="workplaceBusinessCategory"
            label="업종"
            placeholder="업종"
            value={form.workplaceBusinessCategory}
            onChange={(value) => handleChange("workplaceBusinessCategory", value)}
          />
        </div>

        <AddressInput
          id="workplaceAddress"
          placeholder="상세주소"
          value={{
            zipcode: form.workplaceZipcode,
            roadAddress: form.workplaceRoadAddress,
            detailAddress: form.workplaceDetailAddress,
          }}
          onChange={handleWorkplaceAddressChange}
        />
      </FieldGroup>
    </FormDialog>
  );
};