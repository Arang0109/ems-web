import { useState } from "react";

import { toFormValue } from "@shared/lib";

import { useChangeClientAction } from "@entities/schedule";
import type { ClientSnapshot } from "@entities/schedule";

import type { AddressValue } from "@shared/model";
import { toast } from "@shared/ui/toasts";

import type { ScheduleClientUpdateForm } from "../types";
import { toClientSnapshotUpdate } from "../mapper";
import { validateScheduleClientFields } from "../validator";

interface Props {
  scheduleId: number;
  client: ClientSnapshot;
  onSuccess: () => void;
}

export const useUpdateScheduleClient = ({ scheduleId, client, onSuccess }: Props) => {
  const { changeClient, isLoading } = useChangeClientAction();

  const workplace = client.workplace;
  const stack = workplace.stack;

  // 부모가 key로 리마운트하므로 prop은 초기값으로만 쓴다(useEffect 동기화 금지).
  const [form, setForm] = useState<ScheduleClientUpdateForm>({
    name: client.name ?? "",
    bizNumber: client.bizNumber ?? "",
    representative: client.representative ?? "",
    zipcode: client.zipcode ?? "",
    roadAddress: client.roadAddress ?? "",
    detailAddress: client.detailAddress ?? "",
    email: client.email ?? "",
    tel: client.tel ?? "",
    workplaceName: workplace.name ?? "",
    workplaceBizNumber: workplace.bizNumber ?? "",
    workplaceGrade: workplace.grade,
    workplaceZipcode: workplace.zipcode ?? "",
    workplaceRoadAddress: workplace.roadAddress ?? "",
    workplaceDetailAddress: workplace.detailAddress ?? "",
    stackField: stack.field,
    stackName: stack.name ?? "",
    stackSemsNumber: stack.semsNumber ?? "",
    stackGrade: stack.grade,
    businessCategory: stack.businessCategory ?? "",
    mainProduct: stack.mainProduct ?? "",
    standardOxygen: toFormValue(stack.standardOxygen),
    height: toFormValue(stack.height),
    horizontalLength: toFormValue(stack.horizontalLength),
    verticalLength: toFormValue(stack.verticalLength),
    shape: stack.shape,
    orientation: stack.orientation,
  });

  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof ScheduleClientUpdateForm, string>>>();

  const handleChange = (name: keyof ScheduleClientUpdateForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // 의뢰기관과 사업장이 각자 주소를 가지므로 핸들러를 분리한다.
  const handleClientAddressChange = (
    { zipcode, roadAddress, detailAddress }: AddressValue,
  ) => {
    setForm((prev) => ({ ...prev, zipcode, roadAddress, detailAddress }));
  };

  const handleWorkplaceAddressChange = (
    { zipcode, roadAddress, detailAddress }: AddressValue,
  ) => {
    setForm((prev) => ({
        ...prev,
        workplaceZipcode: zipcode,
        workplaceRoadAddress: roadAddress,
        workplaceDetailAddress: detailAddress,
      }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateScheduleClientFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      // 의뢰기관·사업장·측정시설이 한 트리라 PATCH 한 번으로 함께 저장한다.
      await changeClient(scheduleId, toClientSnapshotUpdate(form));
      toast.success("의뢰기관 정보가 수정되었습니다.");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "수정에 실패했습니다.";
      toast.error(message);
    }
  };

  return {
    form, fieldErrors, isLoading, handleChange,
    handleClientAddressChange, handleWorkplaceAddressChange, handleSubmit,
  };
};
