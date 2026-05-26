import type { SignInRequest } from "@auth/api";
import type { SignInFormData } from "@auth/model";

export const mapSignInFormDataToRequest = (formData: SignInFormData): SignInRequest => {
  return {
    username: formData.username,
    password: formData.password,
  }
};