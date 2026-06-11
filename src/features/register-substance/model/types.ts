export type SubstanceRegisterForm = {
  name: string;
  removalEfficiency: string;
}

export const getDefaultSubstanceRegisterForm = (): SubstanceRegisterForm => ({
  name: '',
  removalEfficiency: '',
});
