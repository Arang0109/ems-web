import { useRegisterContract } from "../model/use-register-contract";
import { VAT_INCLUDED_LABEL } from "../model/types";
import { useWorkplaces } from "@entities/workplace";
import { CONTRACT_AMOUNT_UNIT_LABEL, contractAmountUnitOptions, type ContractAmountUnit } from "@entities/contract";

import { SectionTitle, DatePicker, InputGroup, Select, Textarea, InlineInput, FieldGroup } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";

export const RegisterContractForm = () => {
  const { form, handleChange, onSubmit } = useRegisterContract();
  const { data: workplaces, workplaceOptions } = useWorkplaces();

  const handleWorkplaceChange = (value: string) => {
    const selected = workplaces.find((wp) => String(wp.id) === value);

    handleChange("workplaceId", value);

    if (selected) {
      handleChange("workplaceName", selected.workplaceName);
      handleChange("workplaceAddress", selected.address ?? "");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
          <div className="flex justify-between">
            <SectionTitle>계약 정보</SectionTitle>
            <Button type="submit">계약 작성</Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              id="workplaceId"
              label="측정대상 사업장"
              placeholder="사업장 선택"
              value={form.workplaceName}
              options={workplaceOptions}
              onValueChange={value => value && handleWorkplaceChange(value)}
            />

            <InputGroup
              id="workplaceAddress"
              label="사업장 소재지"
              placeholder="사업장 소재지"
              value={form.workplaceAddress}
              onChange={(value) => handleChange("workplaceAddress", value)}
              disabled
              readOnly
            />
          </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputGroup
              id="contractAmount"
              type="number"
              label="계약금액(원)"
              value={form.contractAmount}
              onChange={(value) => handleChange("contractAmount", value)}
            />
            <Select
              id="contractAmountUnit"
              label="계약금액 단위"
              placeholder="단위 선택"
              value={CONTRACT_AMOUNT_UNIT_LABEL[form.contractAmountUnit]}
              options={contractAmountUnitOptions}
              onValueChange={(value) => value && handleChange("contractAmountUnit", value as ContractAmountUnit)}
            />
            <Select
              id="vatIncluded"
              label="부가세 여부"
              placeholder="선택"
              value={VAT_INCLUDED_LABEL[String(form.vatIncluded) as 'true' | 'false']}
              options={[
                { value: 'true', label: '포함' },
                { value: 'false', label: '미포함' },
              ]}
              onValueChange={(value) => value && handleChange("vatIncluded", value === 'true')}
            />
            <InputGroup
              id="contractGuaranteeAmount"
              type="number"
              label="계약보증금"
              value={form.contractGuaranteeAmount}
              onChange={(value) => handleChange("contractGuaranteeAmount", value)}
            />
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <InputGroup
              id="advancePaymentAmount"
              type="number"
              label="선금"
              value={form.advancePaymentAmount}
              onChange={(value) => handleChange("advancePaymentAmount", value)}
            />
            <InlineInput
              id="advancePaymentDueDate"
              prefix="계약체결 후"
              suffix="일 이내 지급"
              type="number"
              width="w-12"
              value={form.advancePaymentDueDate}
              onChange={(value) => handleChange("advancePaymentDueDate", Number(value))}
            />
            <InlineInput
              id="delayPenaltyRate"
              prefix="지체 상금율 : 계약금액의"
              suffix="%"
              type="number"
              width="w-12"
              value={form.delayPenaltyRate}
              onChange={(value) => handleChange("delayPenaltyRate", Number(value))}
            />
          </div>
          <Textarea
            id="remark"
            label="비고"
            value={form.remark}
              onChange={(value) => handleChange("remark", value)}
          /> 
      </FieldGroup>
    </form>
  );
}