import type { Client } from "@entities/client";
import type { Grade } from "@shared/model";

export type WorkplaceRegisterForm = {
  clientId: number;
  clientName: string;
  clientBizNumber: string;
  representative: string;
  workplaceName: string;
  workplaceBizNumber: string;
  workplaceBusinessCategory: string;
  workplaceZipcode: string;
  workplaceRoadAddress: string;
  workplaceDetailAddress: string;
  facilityManager: string;
  samplingWitness: string;
  grade: Grade;
}

export const getDefaultWorkplaceRegisterForm = (client?: Client | null): WorkplaceRegisterForm => ({
  clientId: client?.id ?? 0,
  clientName: client?.name ?? "",
  clientBizNumber: client?.bizNumber ?? "",
  representative: client?.representative ?? "",
  workplaceName: "",
  workplaceBizNumber: "",
  workplaceBusinessCategory: "",
  workplaceZipcode: "",
  workplaceRoadAddress: "",
  workplaceDetailAddress: "",
  facilityManager: "",
  samplingWitness: "",
  grade: "TYPE_1",
});