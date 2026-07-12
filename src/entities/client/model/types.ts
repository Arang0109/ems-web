import type { ClientResponse } from "../api/dto";

export type Client = ClientResponse

export type ClientCreate = {
  name: string;
  bizNumber: string;
  representative: string;
  zipcode: string;
  roadAddress: string;
  address: string;

  manager: string;
  email: string;
  tel: string;
}

export type ClientUpdate = {
  name: string;
  bizNumber: string;
  representative: string;
  zipcode: string;
  roadAddress: string;
  address: string;

  manager: string;
  email: string;
  tel: string;
}