export type ClientUpdateForm = {
  name: string;
  representative: string;
  zipcode: string;
  roadAddress: string;
  detailAddress: string;
  bizNumber: string;

  manager: string;
  email: string;
  tel: string;
}

export const getDefaultForm = (): ClientUpdateForm => ({
  name: "",
  bizNumber: "",
  zipcode: "",
  roadAddress: "",
  detailAddress: "",
  representative: "",
  manager: "",
  email: "",
  tel: "",
});