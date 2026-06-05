import { FieldGroup } from "@/components/ui/field";

import { FormDialog } from "@shared/ui/dialogs";
import { InputGroup, SectionTitle } from "@shared/ui/form";

import { Building2, Hash, MapPin } from "lucide-react";

import type { WorkplaceTableRow } from "../model/types";

interface WorkplaceDetailFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workplace: WorkplaceTableRow | null;
  onEdit?: () => void;
}

export const WorkplaceDetailForm = ({ open, onOpenChange, workplace, onEdit }: WorkplaceDetailFormProps) => (
  <FormDialog
    title='사업장 상세'
    open={open}
    onOpenChange={onOpenChange}
    cancelLabel='닫기'
    submitLabel='수정'
    onSubmit={onEdit}
  >
    <FieldGroup>
      {/* 기관 정보 */}
      <SectionTitle>사업장 정보</SectionTitle>
      <InputGroup
        id="companyName"
        label="측정대행 의뢰기관"
        placeholder="측정대행 의뢰기관"
        value={workplace?.companyName ?? ''}
        helperText="사업자등록증상에 기재된 상호"
        startIcon={<Building2 />}
        disabled
        readOnly
      />
      <InputGroup
        id="name"
        label="측정대상 사업장"
        value={workplace?.workplaceName ?? ''}
        onChange={() => {}}
        startIcon={<Building2 />}
      />
      <div className="grid md:grid-cols-2 gap-4">
        <InputGroup
          id="bizNumber"
          label="사업자등록번호"
          value={workplace?.bizNumber ?? ''}
          onChange={() => {}}
          startIcon={<Hash />}
        />
      <InputGroup
        id="address"
        label="주소"
        value={workplace?.address ?? ''}
        onChange={() => {}}
        startIcon={<MapPin />}
      />
      </div>
    </FieldGroup>
  </FormDialog>
);
