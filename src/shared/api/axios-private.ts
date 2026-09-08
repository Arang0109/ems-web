import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { axiosPublic } from '@shared/api/axios-public';
import type { ApiResponseMessage } from '@shared/model';

export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosPrivate.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 액세스 토큰이 새로 발급됐음을 알리는 전역 이벤트.
 *
 * HTTP 요청은 매번 `localStorage` 에서 토큰을 읽으므로 갱신을 신경 쓸 필요가 없지만,
 * **WebSocket 은 접속할 때 딱 한 번 토큰을 싣는다.** 갱신 뒤에도 옛 신원으로 붙어 있게
 * 되므로 다시 접속해야 하고, 그 신호가 이것이다.
 */
export const ACCESS_TOKEN_REFRESHED = 'ems:access-token-refreshed';

/**
 * 진행 중인 재발급 요청. 토큰이 만료되면 화면의 여러 요청이 동시에 401을 받는데,
 * 각자 재발급을 호출하면 같은 일을 N번 하게 된다. 첫 요청의 Promise를 공유해
 * 재발급은 한 번만 나가고 나머지는 그 결과를 기다린다.
 */
let refreshRequest: Promise<string> | null = null;

/**
 * 액세스 토큰 재발급. 동시에 여러 번 불려도 요청은 한 번만 나간다.
 *
 * WebSocket 도 이 함수를 쓴다 — 자기 재발급 경로를 따로 두면 두 개가 동시에 나가
 * 하나가 무효가 된다.
 */
export const refreshAccessToken = (): Promise<string> => {
  if (!refreshRequest) {
    refreshRequest = axiosPublic
      .post<ApiResponseMessage<string>>('/auth/refresh')
      .then((response) => {
        const accessToken = response.data.data;
        if (!accessToken) throw new Error('재발급 응답에 accessToken이 없습니다.');

        localStorage.setItem('accessToken', accessToken);
        window.dispatchEvent(new Event(ACCESS_TOKEN_REFRESHED));
        return accessToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

axiosPrivate.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<ApiResponseMessage<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 🔹 401 refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        // 재발급까지 실패 = 세션 종료. 저장된 인증 정보를 모두 비우고 로그인 화면으로 돌린다
        // (accessToken만 지우면 authUser가 남아 다음 로그인 전까지 옛 사용자 정보가 보인다).
        localStorage.removeItem('accessToken');
        localStorage.removeItem('authUser');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.data) {
      return Promise.resolve(error.response);
    }

    return Promise.reject(error);
  }
);
