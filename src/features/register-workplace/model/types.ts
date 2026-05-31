import type { Company } from "@entities/company";

export type WorkplaceRegisterForm = {
  companyId: number;
  companyName: string;
  companyBizNumber: string;
  companyCeo: string;
  workplaceName: string;
  workplaceBizNumber: string;
  workplaceAddress: string;
}

export const getDefaultWorkplaceRegisterForm = (company?: Company | null): WorkplaceRegisterForm => ({
  companyId: company?.id ?? 0,
  companyName: company?.name ?? "",
  companyBizNumber: company?.bizNumber ?? "",
  companyCeo: company?.ceoName ?? "",
  workplaceName: "",
  workplaceBizNumber: "",
  workplaceAddress: "",
});