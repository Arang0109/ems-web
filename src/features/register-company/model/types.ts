export type CompanyRegisterForm = {
  name: string;
  bizNumber: string;
  representative: string;
  address: string;

  manager: string;
  email: string;
  tel: string;

  isBizNumberChecked: boolean;
}

export const getDefaultCompanyRegisterForm = (): CompanyRegisterForm => ({
  name: "",
  bizNumber: "",
  address: "",
  representative: "",
  manager: "",
  email: "",
  tel: "",

  isBizNumberChecked: true,
});