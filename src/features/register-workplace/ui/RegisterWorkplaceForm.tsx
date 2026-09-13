import { Divider } from "@shared/ui/borders";
import type { Client } from "@entities/client";

import { FieldGroup, InputGroup, SectionTitle, AddressInput, Select, Checkbox } from "@shared/ui/form";
import { FormDialog } from "@shared/ui/dialogs";
import type { Grade } from "@shared/model";
import { gradeOptions } from "@shared/model";

import { Building2, Hash, User2, Factory, Plus } from "lucide-react";

import { useRegisterWorkplace } from "../model/hooks/use-register-workplace";

interface RegisterWorkplaceFormProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterWorkplaceForm = ({
  client,
  open,
  onOpenChange,
  onSuccess,
}: RegisterWorkplaceFormProps) => {
  const { form, handleChange, handleAddressChange, handleSubmit, copyClientInfo, checked } = useRegisterWorkplace({
    client,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel={<><Plus /> 등록</>}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel='등록'
      disabled={!client}
    >
      <FieldGroup>
        <SectionTitle>의뢰기관 정보</SectionTitle>
        <InputGroup
          id="clientName"
          label="측정대행 의뢰기관"
          placeholder="측정대행 의뢰기관"
          value={client?.name ?? ''}
          helperText="사업자등록증상에 기재된 상호"
          startIcon={<Building2 />}
          disabled
          readOnly
        />
        <div className="grid grid-cols-2 gap-4">
          <InputGroup
            id="clientBizNumber"
            label="의뢰기관 사업자등록번호"
            placeholder="사업자등록번호"
            value={client?.bizNumber ?? ''}
            startIcon={<Hash />}
            disabled
            readOnly
          />
          <InputGroup
            id="representative"
            label="대표자"
            placeholder="대표자"
            value={client?.representative ?? ''}
            startIcon={<User2 />}
            disabled
            readOnly
          />
        </div>

        <Divider />

        <SectionTitle>사업장 정보</SectionTitle>
        <Checkbox
          label="의뢰기관 정보와 동일"
          onChange={() => copyClientInfo()}
          checked={checked}
        />
        <InputGroup
          id="workplaceName"
          label="측정대상 사업장"
          placeholder="측정대상 사업장"
          value={form.workplaceName}
          onChange={(value) => handleChange("workplaceName", value)}
          startIcon={<Factory />}
        />
        <InputGroup
          id="workplaceBizNumber"
          label="사업장 사업자등록번호"
          placeholder="사업자등록번호"
          code="business"
          value={form.workplaceBizNumber}
          onChange={(value) => handleChange("workplaceBizNumber", value)}
          startIcon={<Hash />}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="grade"
            label="시설 종별"
            placeholder="종별 선택"
            options={gradeOptions}
            value={form.grade}
            onValueChange={(value) => value && handleChange("grade", value as Grade)}
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
          placeholder="사업장 상세주소"
          value={{ zipcode: form.workplaceZipcode, roadAddress: form.workplaceRoadAddress, detailAddress: form.workplaceDetailAddress }}
          onChange={handleAddressChange}
        />
        <InputGroup
          id="facilityManager"
          label="배출시설 관리자"
          placeholder="배출시설 관리자"
          value={form.facilityManager}
          onChange={(value) => handleChange("facilityManager", value)}
          startIcon={<User2 />}
        />
        <InputGroup
          id="samplingWitness"
          label="환경기술인"
          placeholder="채취 증인"
          value={form.samplingWitness}
          onChange={(value) => handleChange("samplingWitness", value)}
          startIcon={<User2 />}
        />
      </FieldGroup>
    </FormDialog>
  );
}
