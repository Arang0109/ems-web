import { useState } from 'react';

import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle, FieldGroup } from "@shared/ui/form";
import { formatPhoneNumber, stripFormatting, formatBusinessNumber } from '@shared/lib/formatters';

import { MailIcon, User2Icon, Phone, Building2, Hash, MapPin } from "lucide-react";

import type { CompanyTableRow, CompanyDetailFormData } from "../model/types";

interface CompanyDetailFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyTableRow | null;
  onEdit?: (data: CompanyDetailFormData) => void;
  onDelete?: () => void;
}

export const CompanyDetailForm = ({ open, onOpenChange, company, onEdit, onDelete }: CompanyDetailFormProps) => {
  const [form, setForm] = useState<CompanyDetailFormData>({
    name: company?.name ?? '',
    bizNumber: company?.bizNumber ?? '',
    representative: company?.representative ?? '',
    address: company?.address ?? '',
    manager: company?.manager ?? '',
    email: company?.email ?? '',
    tel: company?.tel ?? '',
  });

  const handleChange = (field: keyof CompanyDetailFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => onEdit?.(form);

  return (
    <FormDialog
      title='의뢰기관 상세'
      open={open}
      onOpenChange={onOpenChange}
      deleteLabel='삭제'
      cancelLabel='닫기'
      submitLabel='수정'
      onSubmit={handleSubmit}
      onDelete={onDelete}
    >
      <FieldGroup>
        <SectionTitle>기관 정보</SectionTitle>
        <InputGroup
          id="name"
          label="측정대행 의뢰기관"
          value={form.name}
          onChange={(value) => handleChange('name', value)}
          startIcon={<Building2 />}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="bizNumber"
            label="사업자등록번호"
            value={formatBusinessNumber(form.bizNumber)}
            onChange={(value) => handleChange("bizNumber", stripFormatting(value).slice(0, 10))}
            startIcon={<Hash />}
          />
          <InputGroup
            id="representative"
            label="대표자"
            value={form.representative}
            onChange={(value) => handleChange('representative', value)}
            startIcon={<User2Icon />}
          />
        </div>
        <InputGroup
          id="address"
          label="주소"
          value={form.address}
          onChange={(value) => handleChange('address', value)}
          startIcon={<MapPin />}
        />

        <Divider />

        <SectionTitle>담당자 정보</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="manager"
            placeholder="담당자명"
            value={form.manager}
            onChange={(value) => handleChange('manager', value)}
            startIcon={<User2Icon />}
          />
          <InputGroup
            id="tel"
            placeholder="전화번호"
            value={formatPhoneNumber(form.tel)}
            onChange={(value) => handleChange('tel', value)}
            startIcon={<Phone />}
          />
          <InputGroup
            id="email"
            placeholder="이메일"
            value={form.email}
            onChange={(value) => handleChange('email', value)}
            startIcon={<MailIcon />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
