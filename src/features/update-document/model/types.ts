export type DocumentUpdateForm = {
  name: string;
  category: string;   // DocumentCategory Select 값
  description: string;
};

export const getDefaultDocumentUpdateForm = (): DocumentUpdateForm => ({
  name: '',
  category: '',
  description: '',
});
