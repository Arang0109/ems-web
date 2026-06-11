export type WorkplaceUpdateForm = {
  name: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  bizNumber: string;
}

export const getDefaultForm = (): WorkplaceUpdateForm => ({
  name: "",
  bizNumber: "",
  zipcode: "",
  roadAddress: "",
  address: "",
});