import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";
import type { EquipType } from "@shared/model";

import { equipmentApi } from "../api/api";
import { equipmentKeys } from "./query-keys";
import type { Equipment } from "./types";

/** 장비 목록. `type` 을 주면 그 유형만 조회한다. */
export const useEquipments = (type?: EquipType) =>
  useEntityQuery<Equipment[]>({
    queryKey: equipmentKeys.list(type),
    queryFn: async () => unwrapMessage(await equipmentApi.getEquipments(type)),
    initialData: [],
    invalidateKey: equipmentKeys.lists(),
  });
