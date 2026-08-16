export type PreventionRegisterForm = {
  name: string;
  capacity: string;
  unit: string;
  targetName: string;
  removalEfficiency: string;
}

export const getDefaultPreventionRegisterForm = (): PreventionRegisterForm => ({
  name: '',
  capacity: '',
  unit: '',
  targetName: '',
  removalEfficiency: '',
});
