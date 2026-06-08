export type WorkplaceUpdateForm = {
  name: string;
  address: string;
  bizNumber: string;
}

export const getDefaultForm = (): WorkplaceUpdateForm => ({
  name: "",
  bizNumber: "",
  address: "",
});