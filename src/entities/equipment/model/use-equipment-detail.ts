import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { equipmentApi } from "../api/api";
import type { Equipment } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  id: string | null;
}

/** 타입 A(자동 로드): 장비 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useEquipmentDetail = ({ id }: Props) =>
  useFetch<Equipment | null>(
    async () => unwrapMessage(await equipmentApi.getEquipment(id as string)),
    null,
    { deps: [id], enabled: id != null, resetOnChange: true },
  );
