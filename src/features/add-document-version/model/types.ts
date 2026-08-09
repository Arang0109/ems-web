export type DocumentVersionForm = {
  changeNote: string;
  file: File | null;
};

export const getDefaultDocumentVersionForm = (): DocumentVersionForm => ({
  changeNote: '',
  file: null,
});
