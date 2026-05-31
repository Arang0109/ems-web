import { FieldGroup } from "@/components/ui/field";

import { useRegisterContract } from "../model/use-register-contract";

import { SectionTitle, DatePicker, InputGroup } from "@shared/ui/form";

export const RegisterContractForm = () => {
  const { form, handleChange } = useRegisterContract();

  return (
    <FieldGroup>
      <SectionTitle>계약 정보</SectionTitle>
      <InputGroup
        id="contractName"
        label="용역명"
        placeholder="용역명"
        value={form.contractName}
        onChange={(value) => handleChange("contractName", value)}
        required
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DatePicker
          id="contractDate"
          label="계약일자"
          value={form.contractDate}
          onChange={(date) => handleChange("contractDate", date ?? new Date())}
          required
        />
        <DatePicker
          id="startDate"
          label="착수일자"
          value={form.startDate}
          onChange={(date) => handleChange("startDate", date ?? new Date())}
          required
        />
        <DatePicker
          id="completionDate"
          label="완수일자"
          value={form.completionDate}
          onChange={(date) => handleChange("completionDate", date ?? new Date())}
          required
        />
      </div>
      
    </FieldGroup>
  );
}