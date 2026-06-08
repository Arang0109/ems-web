import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

import { signInApi, useAuth } from "@entities/auth";

import { mapSignInFormDataToRequest } from "../model/mapper";
import type { SignInFormData } from "../model/types";

import type { ApiResponseMessage } from "@shared/model";
import { toast } from "@shared/ui/toasts";

const REMEMBER_ID_KEY = "rememberedUsername";

const getRememberedUsername = () => localStorage.getItem(REMEMBER_ID_KEY);

export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<SignInFormData>({
    username: getRememberedUsername() || "",
    password: "",
    rememberedUsername: Boolean(getRememberedUsername()),
  });

  const handleChange = (name: keyof SignInFormData, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [name]: name === "rememberedUsername" ? Boolean(value) : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    if (form.rememberedUsername) {
      localStorage.setItem(REMEMBER_ID_KEY, form.username);
    } else {
      localStorage.removeItem(REMEMBER_ID_KEY);
    }

    const payload = mapSignInFormDataToRequest(form);

    try {
      const res = await signInApi(payload);
       setError(false);

      toast.success('로그인에 성공했습니다.');
      login(res.data.accessToken);
      navigate("/dashboard", { replace: true });

    } catch (error: unknown) {
      setError(true);
      let message = '로그인 중 오류가 발생했습니다.';

      if (axios.isAxiosError(error)) {
        const apiError = error as AxiosError<ApiResponseMessage<null>>;
        message = apiError.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,

    onSubmit,
    handleChange,

    isLoading, error,
  };
}
