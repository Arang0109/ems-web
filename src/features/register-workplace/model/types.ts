import type { Company } from "@entities/company";
import type { Grade } from "@shared/model";

export type WorkplaceRegisterForm = {
  companyId: number;
  companyName: string;
  companyBizNumber: string;
  representative: string;
  workplaceName: string;
  workplaceBizNumber: string;
  workplaceZipcode: string;
  workplaceRoadAddress: string;
  workplaceAddress: string;
  grade: Grade;
}

export const getDefaultWorkplaceRegisterForm = (company?: Company | null): WorkplaceRegisterForm => ({
  companyId: company?.id ?? 0,
  companyName: company?.name ?? "",
  companyBizNumber: company?.bizNumber ?? "",
  representative: company?.representative ?? "",
  workplaceName: "",
  workplaceBizNumber: "",
  workplaceZipcode: "",
  workplaceRoadAddress: "",
  workplaceAddress: "",
  grade: "TYPE_1",
});