export type WorkplaceTableRow = {
  id: number;
  companyId: number;
  companyName: string;
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