import { FieldGroup } from "@/components/ui/field"
import { Divider } from "@shared/ui/borders";
import type { Company } from "@/entities/company";
import { InputGroup, SectionTitle } from "@/shared/ui/form";

import { Building2, Hash, User2, MapPin, Factory } from "lucide-react";

export const RegisterWorkplaceForm = ({
  company
}: {company: Company | null | undefined}) => {
  return(
    <FieldGroup>
      <SectionTitle>의뢰기관 정보</SectionTitle>
      <InputGroup
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
          label="의뢰기관 사업자등록번호"
          placeholder="사업자등록번호"
          value={company?.bizNumber ?? ''}
          startIcon={<Hash />}
          disabled
          readOnly
        />
        <InputGroup
          label="대표자"
          placeholder="대표자"
          value={company?.ceoName ?? ''}
          startIcon={<User2 />}
          disabled
          readOnly
        />
      </div>

      <Divider />

      <SectionTitle>사업장 정보</SectionTitle>
      <InputGroup
        id="name"
        label="측정대상 사업장"
        placeholder="측정대상 사업장"
        value=""
        onChange={() => undefined}
        startIcon={<Factory />}
      />
      <InputGroup
        id="bizNumber"
        label="사업장 사업자등록번호"
        placeholder="사업자등록번호"
        value=""
        onChange={() => undefined}
        startIcon={<Hash />}
      />
      <InputGroup
        id="address"
        label="사업장 주소"
        placeholder="사업장 주소"
        value=""
        onChange={() => undefined}
        startIcon={<MapPin />}
      />
    </FieldGroup>
  );
}
