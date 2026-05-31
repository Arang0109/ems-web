export type CompanyRegisterForm = {
  name: string;
  bizNumber: string;
  ceoName: string;
  address: string;

  manager: string;
  email: string;
  tell: string;

  isBizNumberChecked: boolean;
}

export const getDefaultCompanyRegisterForm = (): CompanyRegisterForm => ({
  name: "",
  bizNumber: "",
  address: "",
  ceoName: "",
  manager: "",
  email: "",
  tell: "",

  isBizNumberChecked: true,
});