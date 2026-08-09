// 파일은 문자열로 표현할 수 없어 Form에서도 File을 그대로 보유한다(숫자 필드는 없음).
export type DocumentRegisterForm = {
  name: string;
  category: string;   // DocumentCategory Select 값
  description: string;
  changeNote: string;
  file: File | null;
};

export const getDefaultDocumentRegisterForm = (category: string = ''): DocumentRegisterForm => ({
  name: '',
  category,
  description: '',
  changeNote: '',
  file: null,
});
