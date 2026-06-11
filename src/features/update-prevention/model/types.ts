export type PreventionUpdateForm = {
  name: string;
}

export const getDefaultPreventionUpdateForm = (prevention?: { name: string }): PreventionUpdateForm => ({
  name: prevention?.name ?? '',
});
