import { format } from "date-fns";

import { useRegisterSchedule } from "../model/hooks/use-register-schedule";

import { SectionTitle, DatePicker, InputGroup, Select, MultiSelect, FieldGroup } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";
import { measurementFieldOptions, measurementTypeOptions } from "@shared/model";
import { Send } from "lucide-react";

export const RegisterScheduleForm = () => {
  const {
    form,
    fieldErrors,
    isLoading,

    handleChange,
    handleClientChange,
    handleWorkplaceChange,
    handleStackChange,
    handleTeamChange,
    handlePollutantsChange,
    handleSubmit,

    clientOptions,
    workplaceOptions,
    stackOptions,
    teamOptions,

    pollutantGroups,
    stackPollutantsLoading,
    userOptions,
  } = useRegisterSchedule();

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex justify-between">
          <SectionTitle>측정 대상</SectionTitle>
          <Button type="submit" disabled={isLoading} startIcon={Send}>측정계획 등록</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Select
            id="clientId"
            searchable
            label="거래처"
            placeholder="거래처 선택"
            value={form.clientId}
            options={clientOptions}
            onValueChange={(value) => handleClientChange(value ?? "")}
            errorMessage={fieldErrors?.clientId}
            required
          />
          <Select
            id="workplaceId"
            searchable
            label="사업장"
            placeholder="사업장 선택"
            value={form.workplaceId}
            options={workplaceOptions}
            onValueChange={(value) => handleWorkplaceChange(value ?? "")}
            errorMessage={fieldErrors?.workplaceId}
            disabled={!form.clientId}
            required
          />
          <Select
            id="stackId"
            searchable
            label="측정시설"
            placeholder="측정시설 선택"
            value={form.stackId}
            options={stackOptions}
            onValueChange={(value) => handleStackChange(value ?? "")}
            errorMessage={fieldErrors?.stackId}
            disabled={!form.workplaceId}
            required
          />
        </div>

        {/* 위 세 Select 와 같은 규약으로 둔다 — 조건부 마운트 대신 disabled 로 잠가
            측정시설을 고를 때 폼 높이가 출렁이지 않게 한다. */}
        <MultiSelect
          id="pollutantIds"
          label="측정항목"
          placeholder={stackPollutantsLoading ? "측정항목을 불러오는 중..." : "측정항목 선택"}
          emptyText="등록된 측정항목이 없습니다."
          value={form.pollutantIds}
          groups={pollutantGroups}
          onValueChange={handlePollutantsChange}
          errorMessage={fieldErrors?.pollutantIds}
          disabled={!form.stackId || stackPollutantsLoading}
          required
        />

        <SectionTitle>측정 정보</SectionTitle>

        <div className="grid md:grid-cols-4 gap-4">
          <InputGroup
            id="referenceNumber"
            label="관리번호"
            placeholder="관리번호"
            value={form.referenceNumber}
            onChange={(value) => handleChange("referenceNumber", value)}
          />
          <DatePicker
            id="measureDate"
            label="측정 일자"
            value={form.measureDate ? new Date(form.measureDate) : undefined}
            onChange={(date) => handleChange("measureDate", date ? format(date, "yyyy-MM-dd") : "")}
            errorMessage={fieldErrors?.measureDate}
            required
          />
          <Select
            id="measurementField"
            label="측정 분야"
            placeholder="측정 분야 선택"
            value={form.measurementField}
            options={measurementFieldOptions}
            onValueChange={(value) => handleChange("measurementField", value ?? "")}
            helperText={fieldErrors?.measurementField}
            required
          />
          <Select
            id="measurementType"
            label="측정 용도"
            placeholder="측정 용도 선택"
            value={form.measurementType}
            options={measurementTypeOptions}
            onValueChange={(value) => handleChange("measurementType", value ?? "")}
          />
        </div>

        <SectionTitle>측정 팀</SectionTitle>

        <div className="grid md:grid-cols-3 gap-4">
          <Select
            id="teamId"
            searchable
            label="측정 팀"
            placeholder="측정 팀 선택"
            value={form.teamId}
            options={teamOptions}
            onValueChange={(value) => handleTeamChange(value ?? "")}
            errorMessage={fieldErrors?.teamId}
            required
          />
          <Select
            id="mentorId"
            searchable
            label="측정 사수"
            placeholder="측정 사수 선택"
            value={form.mentorId}
            options={userOptions}
            onValueChange={(value) => handleChange("mentorId", value ?? "")}
            errorMessage={fieldErrors?.mentorId}
            required
          />
          <Select
            id="menteeId"
            searchable
            label="측정 부사수"
            placeholder="측정 부사수 선택"
            value={form.menteeId}
            options={userOptions}
            onValueChange={(value) => handleChange("menteeId", value ?? "")}
            errorMessage={fieldErrors?.menteeId}
            required
          />
        </div>
      </FieldGroup>
    </form>
  );
};
