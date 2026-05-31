import type { SignInRequest } from "@entities/auth";
import type { SignInFormData } from "../model/types";

export const mapSignInFormDataToRequest = (formData: SignInFormData): SignInRequest => {
  return {
    username: formData.username,
    password: formData.password,
  }
};