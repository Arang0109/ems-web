import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";
import type { EquipType } from "@shared/model";

import { equipmentApi } from "../api/api";
import type { Equipment } from "./types";

/** 타입 A(자동 로드): 장비 목록. `type` 을 주면 그 유형만 조회한다. */
export const useEquipments = (type?: EquipType) =>
  useFetch<Equipment[]>(
    async () => unwrapMessage(await equipmentApi.getEquipments(type)),
    [],
    { deps: [type] },
  );
