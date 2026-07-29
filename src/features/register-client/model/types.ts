export type ClientRegisterForm = {
  name: string;
  bizNumber: string;
  representative: string;

  zipcode: string;
  roadAddress: string;
  detailAddress: string;

  manager: string;
  email: string;
  tel: string;

  isBizNumberChecked: boolean;
}

export const getDefaultForm = (): ClientRegisterForm => ({
  name: "",
  bizNumber: "",
  zipcode: "",
  roadAddress: "",
  detailAddress: "",
  representative: "",
  manager: "",
  email: "",
  tel: "",

  isBizNumberChecked: true,
});