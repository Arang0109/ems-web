export type CompanyUpdateForm = {
  name: string;
  representative: string;
  address: string;
  bizNumber: string;

  manager: string;
  email: string;
  tel: string;
}

export const getDefaultForm = (): CompanyUpdateForm => ({
  name: "",
  bizNumber: "",
  address: "",
  representative: "",
  manager: "",
  email: "",
  tel: "",
});