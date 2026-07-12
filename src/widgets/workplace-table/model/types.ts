export type WorkplaceTableRow = {
  id: number;
  clientId: number;
  clientName: string;
  workplaceName: string;
  address: string;
  bizNumber: string;
};

export type WorkplaceDetailFormData = {
  name: string;
  zipcode: string;
  roadAddress: string;
  address: string;
  bizNumber: string;
};