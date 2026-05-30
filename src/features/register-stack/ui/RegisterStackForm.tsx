import { FieldGroup } from "@/components/ui/field"
import { Divider } from "@shared/ui/borders";
import type { Workplace } from "@entities/workplace";
import { InputGroup, SectionTitle } from "@/shared/ui/form";

import { Building2, Hash, MapPin, Factory } from "lucide-react";

export const RegisterStackForm = ({
  workplace
}: {workplace: Workplace | null | undefined}) => {
  return(
    <FieldGroup>
      <SectionTitle>사업장 정보</SectionTitle>
      <InputGroup
        label="측정대상 사업장"
        placeholder="측정대상 사업장"
        value={workplace?.name ?? ''}
        helperText="사업자등록증상에 기재된 상호"
        startIcon={<Building2 />}
        disabled
        readOnly
      />

      <Divider />

      <SectionTitle>측정시설 정보</SectionTitle>
      <div className="grid md:grid-cols-2 gap-4">
        <InputGroup
          id="name"
          label="측정시설"
          placeholder="측정시설"
          value=""
          onChange={() => undefined}
          startIcon={<Factory />}
        />
        <InputGroup
          id="semsNumber"
          label="SEMS 번호"
          placeholder="SEMS 번호"
          value=""
          onChange={() => undefined}
          startIcon={<Hash />}
        />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <InputGroup
          id="grade"
          label="시설 종별"
          placeholder="시설 규모"
          value=""
          onChange={() => undefined}
          startIcon={<MapPin />}
        />
        <InputGroup
          id="businessCategory"
          label="업종"
          placeholder="업종"
          value=""
          onChange={() => undefined}
          startIcon={<MapPin />}
        />
        <InputGroup
          id="mainProduct"
          label="주요 생산품"
          placeholder="주요 생산품"
          value=""
          onChange={() => undefined}
          startIcon={<MapPin />}
        />
      </div>
      
    </FieldGroup>
  );
}
