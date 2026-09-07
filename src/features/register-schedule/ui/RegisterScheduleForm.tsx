import { format } from "date-fns";

import { useRegisterSchedule } from "../model/hooks/use-register-schedule";

import { SectionTitle, DatePicker, InputGroup, Select, Checkbox, FieldGroup } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";
import { measurementFieldOptions, measurementTypeOptions } from "@shared/model";
import { MEASUREMENT_CYCLE_LABEL } from "@shared/config";
import { Send } from "lucide-react";

export const RegisterScheduleForm = () => {
  const {
    form,
    mentorName,
    menteeName,
    fieldErrors,
    isLoading,

    handleChange,
    handleClientChange,
    handleWorkplaceChange,
    handleStackChange,
    handleTeamChange,
    handleTogglePollutant,
    handleSubmit,

    clientOptions,
    workplaceOptions,
    stackOptions,
    teamOptions,

    stackPollutants,
    stackPollutantsLoading,
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

        {form.stackId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SectionTitle>측정항목</SectionTitle>
              <span className="text-destructive">*</span>
              {fieldErrors?.pollutantIds && (
                <span className="text-caption text-destructive">{fieldErrors.pollutantIds}</span>
              )}
            </div>
            {stackPollutantsLoading ? (
              <p className="text-body-2 text-muted-foreground">측정항목을 불러오는 중...</p>
            ) : stackPollutants.length === 0 ? (
              <p className="text-body-2 text-muted-foreground">등록된 측정항목이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 rounded-nav border border-border p-4">
                {stackPollutants.map((item) => (
                  <Checkbox
                    key={item.id}
                    id={`pollutant-${item.id}`}
                    checked={form.pollutantIds.includes(String(item.pollutant.id))}
                    onChange={() => handleTogglePollutant(item.pollutant.id)}
                    label={`${item.pollutant.nameKr} · ${MEASUREMENT_CYCLE_LABEL[item.pollutant.cycle]}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

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
          <InputGroup
            id="mentorName"
            label="측정 사수"
            placeholder="측정 사수"
            value={mentorName}
            onChange={(value) => handleChange("mentorName", value)}
          />
          <InputGroup
            id="menteeName"
            label="측정 부사수"
            placeholder="측정 부사수"
            value={menteeName}
            onChange={(value) => handleChange("menteeName", value)}
          />
        </div>
      </FieldGroup>
    </form>
  );
};
