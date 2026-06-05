import { FieldGroup } from "@/components/ui/field";

import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle } from "@shared/ui/form";
import { formatPhoneNumber } from '@shared/lib/formatters';

import { MailIcon, User2Icon, Phone, Building2, Hash, MapPin } from "lucide-react";

import type { CompanyTableRow } from "../model/types";

interface CompanyDetailFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyTableRow | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CompanyDetailForm = ({ open, onOpenChange, company, onEdit, onDelete }: CompanyDetailFormProps) => (
  <FormDialog
    title='의뢰기관 상세'
    open={open}
    onOpenChange={onOpenChange}
    deleteLabel='삭제'
    cancelLabel='닫기'
    submitLabel='수정'
    onSubmit={onEdit}
    onDelete={onDelete}
  >
    <FieldGroup>
      {/* 기관 정보 */}
      <SectionTitle>기관 정보</SectionTitle>
      <InputGroup
        id="name"
        label="측정대행 의뢰기관"
        value={company?.name ?? ''}
        onChange={() => {}}
        startIcon={<Building2 />}
      />
      <div className="grid md:grid-cols-2 gap-4">
        <InputGroup
          id="bizNumber"
          label="사업자등록번호"
          value={company?.bizNumber ?? ''}
          onChange={() => {}}
          startIcon={<Hash />}
        />
        <InputGroup
          id="representative"
          label="대표자"
          value={company?.representative ?? ''}
          onChange={() => {}}
          startIcon={<User2Icon />}
        />
      </div>
      <InputGroup
        id="address"
        label="주소"
        value={company?.address ?? ''}
        onChange={() => {}}
        startIcon={<MapPin />}
      />

      <Divider />

      {/* 담당자 정보 */}
      <SectionTitle>담당자 정보</SectionTitle>
      <div className="grid md:grid-cols-3 gap-4">
        <InputGroup
          id="manager"
          placeholder="담당자명"
          value={company?.manager ?? ''}
          onChange={() => {}}
          startIcon={<User2Icon />}
        />
        <InputGroup
          id="tel"
          placeholder="전화번호"
          value={formatPhoneNumber(company?.tel ?? '')}
          onChange={() => {}}
          startIcon={<Phone />}
        />
        <InputGroup
          id="email"
          placeholder="이메일"
          value={company?.email ?? ''}
          onChange={() => {}}
          startIcon={<MailIcon />}
        />
      </div>
    </FieldGroup>
  </FormDialog>
);
