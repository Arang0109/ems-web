import type { Grade } from "@shared/model";

export type WorkplaceUpdateForm = {
  name: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  bizNumber: string;
  facilityManager: string;
  samplingWitness: string;
  grade: Grade;
}

export const getDefaultForm = (): WorkplaceUpdateForm => ({
  name: "",
  bizNumber: "",
  zipcode: "",
  roadAddress: "",
  address: "",
  facilityManager: "",
  samplingWitness: "",
  grade:"TYPE_1",
});