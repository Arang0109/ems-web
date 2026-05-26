import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

import { signInApi, mapSignInFormDataToRequest } from "@entities/auth/api";
import { useAuth } from "@entities/auth/model";
import type { SignInFormData } from "@entities/auth/model";

import type { ApiResponseMessage } from "@shared/model";


const REMEMBER_ID_KEY = "rememberedUsername";

const getRememberedUsername = () => localStorage.getItem(REMEMBER_ID_KEY);

export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

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

    if (form.rememberedUsername) {
      localStorage.setItem(REMEMBER_ID_KEY, form.username);
    } else {
      localStorage.removeItem(REMEMBER_ID_KEY);
    }

    const payload = mapSignInFormDataToRequest(form);

    try {
      const res = await signInApi(payload);

      if (res.status) {
        login(res.data.accessToken);
        navigate("/dashboard", { replace: true });
        return { success: true };
      }

      return { success: false, message: res.message };
    } catch (error: unknown) {
      let message = "로그인 실패";

      if (axios.isAxiosError(error)) {
        const apiError = error as AxiosError<ApiResponseMessage<null>>;
        message = apiError.response?.data?.message || message;
      }

      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    handleChange,
    isLoading,
  };
}
