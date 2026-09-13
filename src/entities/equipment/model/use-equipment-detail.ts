import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { equipmentApi } from "../api/api";
import { equipmentKeys } from "./query-keys";
import type { Equipment } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  id: string | null;
}

/** 장비 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useEquipmentDetail = ({ id }: Props) =>
  useEntityQuery<Equipment | null>({
    queryKey: equipmentKeys.detail(id as string),
    queryFn: async () => unwrapMessage(await equipmentApi.getEquipment(id as string)),
    initialData: null,
    enabled: id != null,
  });
