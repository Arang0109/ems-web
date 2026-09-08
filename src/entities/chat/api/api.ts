import type { AxiosResponse } from 'axios';

import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';

import type {
  ChatContactResponse,
  ChatMessagePageResponse,
  ChatMessageResponse,
  ChatRoomListResponse,
  ChatRoomResponse,
  MarkAsReadRequest,
  OpenDirectRoomRequest,
  SendMessageRequest,
} from './dto';

/**
 * 채팅 REST — **쓰기는 전부 여기다.** WebSocket 은 수신 전용이라
 * 서버에 클라이언트가 보낼 목적지 자체가 없다.
 */
export const chatApi = {
  /** 1:1 대화방 개설. **멱등** — 이미 있으면 그 방을 돌려준다 */
  openRoom: async (data: OpenDirectRoomRequest): Promise<ApiResponseMessage<ChatRoomResponse>> => {
    const res = await axiosPrivate.post('/chat/rooms', data);
    return res.data;
  },

  getRoomList: async (): Promise<ApiResponseMessage<ChatRoomListResponse[]>> => {
    const res = await axiosPrivate.get('/chat/rooms');
    return res.data;
  },

  getRoom: async (roomId: number): Promise<ApiResponseMessage<ChatRoomResponse>> => {
    const res = await axiosPrivate.get(`/chat/rooms/${roomId}`);
    return res.data;
  },

  /**
   * 메시지 한 페이지. `before` 는 **과거 방향** 커서다(`after` 는 서버에 없다).
   * `size` 를 넘기지 않으면 서버 기본값 50, 상한은 100 이다.
   */
  getMessagePage: async (
    roomId: number,
    params: { before?: string; size?: number },
  ): Promise<ApiResponseMessage<ChatMessagePageResponse>> => {
    const res = await axiosPrivate.get(`/chat/rooms/${roomId}/messages`, { params });
    return res.data;
  },

  sendMessage: async (
    roomId: number,
    data: SendMessageRequest,
  ): Promise<ApiResponseMessage<ChatMessageResponse>> => {
    const res = await axiosPrivate.post(`/chat/rooms/${roomId}/messages`, data);
    return res.data;
  },

  /**
   * 첨부 전송. 파일만 보내는 것이 정상 경로이고 `content` 는 캡션이다.
   *
   * 폼 파라미터를 쓴다 — JSON 파트로 두면 파일만 보내는 클라이언트가 빈 파트를
   * 만들어야 하고, 빠뜨리면 400 이 아니라 500 이 난다(서버가 그래서 바꿨다).
   * `Content-Type` 은 지정하지 않는다. axios 가 `FormData` 를 보고 multipart 경계를
   * 직접 붙이는데, 손으로 헤더를 주면 그 경계가 사라져 서버가 파싱하지 못한다.
   */
  sendAttachment: async (
    roomId: number,
    form: FormData,
  ): Promise<ApiResponseMessage<ChatMessageResponse>> => {
    const res = await axiosPrivate.post(`/chat/rooms/${roomId}/messages/attachments`, form);
    return res.data;
  },

  /** 첨부 원본. **`ApiResponse` 봉투가 없는 바이너리**라 응답을 그대로 돌려준다 */
  downloadAttachment: (roomId: number, messageId: string): Promise<AxiosResponse<Blob>> =>
    axiosPrivate.get(`/chat/rooms/${roomId}/messages/${messageId}/attachment`, {
      responseType: 'blob',
    }),

  markRead: async (
    roomId: number,
    data: MarkAsReadRequest,
  ): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.post(`/chat/rooms/${roomId}/read`, data);
    return res.data;
  },

  /** 방을 지우는 것이 아니라 내 목록에서만 감춘다. 상대가 말을 걸면 다시 나타난다 */
  hideRoom: async (roomId: number): Promise<ApiResponseMessage<void>> => {
    const res = await axiosPrivate.delete(`/chat/rooms/${roomId}`);
    return res.data;
  },

  /** 전역 안읽음 배지. `data` 가 객체가 아니라 **숫자** 다 */
  getUnreadCount: async (): Promise<ApiResponseMessage<number>> => {
    const res = await axiosPrivate.get('/chat/unread-count');
    return res.data;
  },

  /**
   * 대화 상대 목록. 같은 테넌트에서 자기 자신만 뺀 전원이다.
   *
   * `/admin/members` 를 쓰지 않는다 — ADMIN 전용이라 일반 사용자는 403 이고,
   * 이메일·연락처까지 노출된다.
   */
  getContacts: async (): Promise<ApiResponseMessage<ChatContactResponse[]>> => {
    const res = await axiosPrivate.get('/chat/contacts');
    return res.data;
  },
};
