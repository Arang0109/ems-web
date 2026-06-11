export type PreventionRegisterForm = {
  name: string;
}

export const getDefaultPreventionRegisterForm = (): PreventionRegisterForm => ({
  name: '',
});
