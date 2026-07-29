export type PreventionRegisterForm = {
  name: string;
  capacity: string;
  targetName: string;
  removalEfficiency: string;
}

export const getDefaultPreventionRegisterForm = (): PreventionRegisterForm => ({
  name: '',
  capacity: '',
  targetName: '',
  removalEfficiency: '',
});
