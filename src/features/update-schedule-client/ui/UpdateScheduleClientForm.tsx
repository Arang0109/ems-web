import { Hash, Factory, Building2, User2Icon, Phone, MailIcon } from "lucide-react";

import type { ClientSnapshot } from "@entities/schedule";
import {
  measurementFieldOptions, gradeOptions, orientationOptions, shapeOptions,
} from "@shared/model";
import type { Grade, MeasurementField, Orientation, Shape } from "@shared/model";
import { formatBusinessNumber, formatPhoneNumber, unformatNumber } from "@shared/lib";
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import {
  FieldGroup, InputGroup, SectionTitle, HorizontalRadioGroup, Select, AddressInput,
} from "@shared/ui/form";

import { useUpdateScheduleClient } from "../model/hooks/use-update-schedule-client";

interface Props {
  scheduleId: number;
  client: ClientSnapshot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UpdateScheduleClientForm = ({
  scheduleId, client, open, onOpenChange, onSuccess,
}: Props) => {
  const {
    form, fieldErrors, isLoading, handleChange,
    handleClientAddressChange, handleWorkplaceAddressChange, handleSubmit,
  } = useUpdateScheduleClient({
    scheduleId,
    client,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      title="의뢰기관 정보 수정"
      description="입력을 비워도 기존 값이 삭제되지 않고 그대로 유지됩니다."
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel="취소"
      submitLabel="수정"
      isLoading={isLoading}
      size="lg"
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <SectionTitle>의뢰기관 정보</SectionTitle>

        <InputGroup
          id="name"
          label="측정대행 의뢰기관"
          placeholder="측정대행 의뢰기관"
          value={form.name}
          onChange={(value) => handleChange("name", value)}
          invalid={!!fieldErrors?.name}
          error={fieldErrors?.name}
          startIcon={<Building2 />}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="bizNumber"
            label="사업자등록번호"
            placeholder="사업자등록번호"
            value={formatBusinessNumber(form.bizNumber)}
            onChange={(value) => handleChange("bizNumber", unformatNumber(value).slice(0, 10))}
            invalid={!!fieldErrors?.bizNumber}
            error={fieldErrors?.bizNumber}
            startIcon={<Hash />}
          />
          <InputGroup
            id="representative"
            label="대표자"
            placeholder="대표자"
            value={form.representative}
            onChange={(value) => handleChange("representative", value)}
            startIcon={<User2Icon />}
          />
        </div>

        <AddressInput
          id="clientAddress"
          placeholder="상세주소"
          value={{
            zipcode: form.zipcode,
            roadAddress: form.roadAddress,
            detailAddress: form.detailAddress,
          }}
          onChange={handleClientAddressChange}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="tel"
            label="전화번호"
            placeholder="전화번호"
            value={formatPhoneNumber(form.tel)}
            onChange={(value) => handleChange("tel", unformatNumber(value).slice(0, 11))}
            startIcon={<Phone />}
          />
          <InputGroup
            id="email"
            label="이메일"
            placeholder="이메일"
            value={form.email}
            onChange={(value) => handleChange("email", value)}
            startIcon={<MailIcon />}
          />
        </div>

        <Divider />

        <SectionTitle>사업장 정보</SectionTitle>

        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="workplaceName"
            label="측정대상 사업장"
            placeholder="측정대상 사업장"
            value={form.workplaceName}
            onChange={(value) => handleChange("workplaceName", value)}
            invalid={!!fieldErrors?.workplaceName}
            error={fieldErrors?.workplaceName}
            startIcon={<Building2 />}
          />
          <InputGroup
            id="workplaceBizNumber"
            label="사업자등록번호"
            placeholder="사업자등록번호"
            value={formatBusinessNumber(form.workplaceBizNumber)}
            onChange={(value) =>
              handleChange("workplaceBizNumber", unformatNumber(value).slice(0, 10))}
            invalid={!!fieldErrors?.workplaceBizNumber}
            error={fieldErrors?.workplaceBizNumber}
            startIcon={<Hash />}
          />
          <Select
            id="workplaceGrade"
            label="사업장 종별"
            placeholder="종별 선택"
            options={gradeOptions}
            value={form.workplaceGrade}
            onValueChange={(value) => value && handleChange("workplaceGrade", value as Grade)}
          />
          <InputGroup
            id="workplaceBusinessCategory"
            label="업종"
            placeholder="업종"
            value={form.workplaceBusinessCategory}
            onChange={(value) => handleChange("workplaceBusinessCategory", value)}
          />
        </div>

        <AddressInput
          id="workplaceAddress"
          placeholder="상세주소"
          value={{
            zipcode: form.workplaceZipcode,
            roadAddress: form.workplaceRoadAddress,
            detailAddress: form.workplaceDetailAddress,
          }}
          onChange={handleWorkplaceAddressChange}
        />

        <Divider />

        <SectionTitle>측정시설 정보</SectionTitle>
        <HorizontalRadioGroup
          options={measurementFieldOptions}
          value={form.stackField}
          onValueChange={(value) => value && handleChange("stackField", value as MeasurementField)}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="stackName"
            label="측정시설명"
            placeholder="측정시설명"
            value={form.stackName}
            onChange={(value) => handleChange("stackName", value)}
            invalid={!!fieldErrors?.stackName}
            error={fieldErrors?.stackName}
            startIcon={<Factory />}
          />
          <InputGroup
            id="stackSemsNumber"
            label="SEMS 번호"
            placeholder="SEMS 번호"
            value={form.stackSemsNumber}
            onChange={(value) => handleChange("stackSemsNumber", value)}
            invalid={!!fieldErrors?.stackSemsNumber}
            error={fieldErrors?.stackSemsNumber}
            startIcon={<Hash />}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="stackGrade"
            label="시설 종별"
            placeholder="종별 선택"
            options={gradeOptions}
            value={form.stackGrade}
            onValueChange={(value) => value && handleChange("stackGrade", value as Grade)}
          />
          <InputGroup
            id="mainProduct"
            label="주요 생산품"
            placeholder="주요 생산품"
            value={form.mainProduct}
            onChange={(value) => handleChange("mainProduct", value)}
            helperText="비워두면 기존 값이 유지됩니다"
          />
        </div>

        <Divider />

        <div className="grid md:grid-cols-5 gap-4">
          <Select
            id="orientation"
            label="방향"
            placeholder="방향 선택"
            options={orientationOptions}
            value={form.orientation}
            onValueChange={(value) => value && handleChange("orientation", value as Orientation)}
          />
          <InputGroup
            id="height"
            label="측정공 높이 (m)"
            placeholder="측정공 높이"
            value={form.height}
            onChange={(value) => handleChange("height", value)}
            invalid={!!fieldErrors?.height}
            error={fieldErrors?.height}
          />
          <Select
            id="shape"
            label="형태"
            placeholder="형태 선택"
            options={shapeOptions}
            value={form.shape}
            onValueChange={(value) => value && handleChange("shape", value as Shape)}
          />
          <InputGroup
            id="horizontalLength"
            label={form.shape === "CIRCULAR" ? "지름 (m)" : "가로 (m)"}
            placeholder={form.shape === "CIRCULAR" ? "지름" : "가로 길이"}
            value={form.horizontalLength}
            onChange={(value) => handleChange("horizontalLength", value)}
            invalid={!!fieldErrors?.horizontalLength}
            error={fieldErrors?.horizontalLength}
          />

          {form.shape === "RECTANGULAR" && (
            <InputGroup
              id="verticalLength"
              label="세로 (m)"
              placeholder="세로 길이"
              value={form.verticalLength}
              onChange={(value) => handleChange("verticalLength", value)}
              invalid={!!fieldErrors?.verticalLength}
              error={fieldErrors?.verticalLength}
            />
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="standardOxygen"
            label="기준산소농도 (%)"
            placeholder="기준산소농도"
            value={form.standardOxygen}
            onChange={(value) => handleChange("standardOxygen", value)}
            invalid={!!fieldErrors?.standardOxygen}
            error={fieldErrors?.standardOxygen}
            helperText="비워두면 기존 값이 유지됩니다"
          />
        </div>

        <p className="text-caption text-muted-foreground">
          기준산소농도·형태·치수를 변경하면 저장된 측정 데이터가 서버에서 재계산됩니다.
        </p>
      </FieldGroup>
    </FormDialog>
  );
};