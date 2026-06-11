export type CompanyUpdateForm = {
  name: string;
  representative: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  bizNumber: string;

  manager: string;
  email: string;
  tel: string;
}

export const getDefaultForm = (): CompanyUpdateForm => ({
  name: "",
  bizNumber: "",
  zipcode: "",
  roadAddress: "",
  address: "",
  representative: "",
  manager: "",
  email: "",
  tel: "",
});