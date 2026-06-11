import type { Company } from "@entities/company";

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
});