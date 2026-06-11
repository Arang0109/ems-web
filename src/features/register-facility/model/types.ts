export type FacilityRegisterForm = {
  name: string;
  fuelType: string;
  fuelUsage: string;
  fuelInput: string;
}

export const getDefaultFacilityRegisterForm = (): FacilityRegisterForm => ({
  name: '',
  fuelType: '',
  fuelUsage: '',
  fuelInput: '',
});
