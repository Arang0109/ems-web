export type ChatComposerForm = {
  content: string;
  /** 첨부 파일. 한 번에 하나만 보낸다 — 서버가 메시지당 첨부 1개다 */
  file: File | null;
};

export const getDefaultChatComposerForm = (): ChatComposerForm => ({
  content: '',
  file: null,
});
