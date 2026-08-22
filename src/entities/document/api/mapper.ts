import { trimValue } from '@shared/lib';

import type { DocumentCreate, DocumentUpdate, DocumentVersionCreate } from '../model/types';
import type {
  AddDocumentVersionRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from './dto';

export const toRegisterRequest = (vo: DocumentCreate): CreateDocumentRequest => ({
  name: trimValue(vo.name),
  category: vo.category,
  description: trimValue(vo.description),
  changeNote: trimValue(vo.changeNote),
  file: vo.file,
});

export const toAddVersionRequest = (vo: DocumentVersionCreate): AddDocumentVersionRequest => ({
  changeNote: trimValue(vo.changeNote),
  file: vo.file,
});

export const toUpdateRequest = (vo: DocumentUpdate): UpdateDocumentRequest => ({
  name: trimValue(vo.name),
  category: vo.category,
  description: trimValue(vo.description),
});
