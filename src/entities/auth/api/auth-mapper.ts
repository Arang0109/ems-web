import type { SignInRequest } from "./auth-dto";
import type { SignInFormData } from "../model/auth-types";

export const mapSignInFormDataToRequest = (formData: SignInFormData): SignInRequest => {
  return {
    username: formData.username,
    password: formData.password,
  }
};