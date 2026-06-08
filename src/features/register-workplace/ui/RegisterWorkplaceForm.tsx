import { Divider } from "@shared/ui/borders";
import type { Company } from "@/entities/company";
import { FieldGroup, InputGroup, SectionTitle } from "@/shared/ui/form";
import { FormDialog } from "@shared/ui/dialogs";
import { formatBusinessNumber, unformatNumber } from '@shared/lib';

import { Building2, Hash, User2, MapPin, Factory } from "lucide-react";

import { useRegisterWorkplace } from "../model/use-register-workplace";

interface RegisterWorkplaceFormProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterWorkplaceForm = ({
  company,
  open,
  onOpenChange,
  onSuccess,
}: RegisterWorkplaceFormProps) => {
  const { form, handleChange, onSubmit } = useRegisterWorkplace({
    company,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel='측정대상 사업장 등록'
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      submitLabel='등록'
      disabled={!company}
    >
      <FieldGroup>
        <SectionTitle>의뢰기관 정보</SectionTitle>
        <InputGroup
          id="companyName"
          label="측정대행 의뢰기관"
          placeholder="측정대행 의뢰기관"
          value={company?.name ?? ''}
          helperText="사업자등록증상에 기재된 상호"
          startIcon={<Building2 />}
          disabled
          readOnly
        />
        <div className="grid grid-cols-2 gap-4">
          <InputGroup
            id="companyBizNumber"
            label="의뢰기관 사업자등록번호"
            placeholder="사업자등록번호"
            value={company?.bizNumber ?? ''}
            startIcon={<Hash />}
            disabled
            readOnly
          />
          <InputGroup
            id="representative"
            label="대표자"
            placeholder="대표자"
            value={company?.representative ?? ''}
            startIcon={<User2 />}
            disabled
            readOnly
          />
        </div>

        <Divider />

        <SectionTitle>사업장 정보</SectionTitle>
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
          value={formatBusinessNumber(form.workplaceBizNumber)}
          onChange={(value) => handleChange("workplaceBizNumber", unformatNumber(value).slice(0, 10))}
          startIcon={<Hash />}
        />
        <InputGroup
          id="workplaceAddress"
          label="사업장 주소"
          placeholder="사업장 주소"
          value={form.workplaceAddress}
          onChange={(value) => handleChange("workplaceAddress", value)}
          startIcon={<MapPin />}
        />
      </FieldGroup>
    </FormDialog>
  );
}
