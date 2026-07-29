export type FacilityRegisterForm = {
  name: string;
  fuelType: string;
  fuelUsage: string;
  fuelInput: string;
  productOutput: string;
  incinerationAmount: string;
  unit: string;
}

export const getDefaultFacilityRegisterForm = (): FacilityRegisterForm => ({
  name: '',
  fuelType: '',
  fuelUsage: '',
  fuelInput: '',
  productOutput: '',
  incinerationAmount: '',
  unit: '',
});
