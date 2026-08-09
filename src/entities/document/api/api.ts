import type { AxiosResponse } from 'axios';

import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';

import type {
  AddDocumentVersionRequest,
  CreateDocumentRequest,
  DocumentResponse,
  DocumentVersionResponse,
  UpdateDocumentRequest,
} from './dto';

// 서버 계약상 파일 파트명은 'file' 하나로 고정이다.
const FILE_PART = 'file';

export const documentApi = {
  getDocuments: async (category?: string): Promise<ApiResponseMessage<DocumentResponse[]>> => {
    const res = await axiosPrivate.get('/documents', {
      params: category ? { category } : undefined,
    });
    return res.data;
  },

  getDocument: async (id: number): Promise<ApiResponseMessage<DocumentResponse>> => {
    const res = await axiosPrivate.get(`/documents/${id}`);
    return res.data;
  },

  getDocumentVersions: async (id: number): Promise<ApiResponseMessage<DocumentVersionResponse[]>> => {
    const res = await axiosPrivate.get(`/documents/${id}/versions`);
    return res.data;
  },

  /** 생성된 documentId를 반환한다. */
  registerDocument: async (data: CreateDocumentRequest): Promise<ApiResponseMessage<number>> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('description', data.description);
    formData.append('changeNote', data.changeNote);
    formData.append(FILE_PART, data.file);

    // Content-Type을 직접 지정하면 multipart boundary가 빠져 서버가 파트를 파싱하지 못하므로 헤더는 건드리지 않는다.
    const res = await axiosPrivate.post('/admin/documents', formData);
    return res.data;
  },

  /** 부여된 versionNo를 반환한다. changeNote는 서버가 @RequestParam으로 받는다. */
  addDocumentVersion: async (
    id: number,
    data: AddDocumentVersionRequest,
  ): Promise<ApiResponseMessage<number>> => {
    const formData = new FormData();
    formData.append(FILE_PART, data.file);

    const res = await axiosPrivate.post(`/admin/documents/${id}/versions`, formData, {
      params: { changeNote: data.changeNote },
    });
    return res.data;
  },

  updateDocument: async (id: number, data: UpdateDocumentRequest): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.put(`/admin/documents/${id}`, data);
    return res.data;
  },

  deleteDocument: async (id: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/admin/documents/${id}`);
    return res.data;
  },

  // 다운로드 2종은 응답이 ApiResponse로 감싸지지 않은 바이너리이고 파일명이 헤더에 있으므로
  // AxiosResponse 전체를 반환한다. validateStatus는 건드리지 않는다 —
  // 인터셉터를 우회하면 401 자동 refresh가 동작하지 않는다.
  downloadDocument: (id: number): Promise<AxiosResponse<Blob>> =>
    axiosPrivate.get(`/documents/${id}/download`, { responseType: 'blob' }),

  downloadDocumentVersion: (id: number, versionNo: number): Promise<AxiosResponse<Blob>> =>
    axiosPrivate.get(`/documents/${id}/versions/${versionNo}/download`, { responseType: 'blob' }),
};
