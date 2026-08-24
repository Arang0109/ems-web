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
 * 진행 중인 재발급 요청. 토큰이 만료되면 화면의 여러 요청이 동시에 401을 받는데,
 * 각자 재발급을 호출하면 같은 일을 N번 하게 된다. 첫 요청의 Promise를 공유해
 * 재발급은 한 번만 나가고 나머지는 그 결과를 기다린다.
 */
let refreshRequest: Promise<string> | null = null;

const requestAccessToken = (): Promise<string> => {
  if (!refreshRequest) {
    refreshRequest = axiosPublic
      .post<ApiResponseMessage<string>>('/auth/refresh')
      .then((response) => {
        const accessToken = response.data.data;
        if (!accessToken) throw new Error('재발급 응답에 accessToken이 없습니다.');

        localStorage.setItem('accessToken', accessToken);
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
        const accessToken = await requestAccessToken();

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
