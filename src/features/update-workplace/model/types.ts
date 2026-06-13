import type { Grade } from "@shared/model";

export type WorkplaceUpdateForm = {
  name: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  bizNumber: string;
  grade: Grade;
}

export const getDefaultForm = (): WorkplaceUpdateForm => ({
  name: "",
  bizNumber: "",
  zipcode: "",
  roadAddress: "",
  address: "",
  grade:"TYPE_1",
});