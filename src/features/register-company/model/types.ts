export type CompanyRegisterForm = {
  name: string;
  bizNumber: string;
  representative: string;

  zipcode: string;
  roadAddress: string;
  address: string;

  manager: string;
  email: string;
  tel: string;

  isBizNumberChecked: boolean;
}

export const getDefaultForm = (): CompanyRegisterForm => ({
  name: "",
  bizNumber: "",
  zipcode: "",
  roadAddress: "",
  address: "",
  representative: "",
  manager: "",
  email: "",
  tel: "",

  isBizNumberChecked: true,
});