import type { SignInCredentials } from "@entities/auth";
import type { SignInFormData } from "../model/types";

export const toSignInCredentials = (formData: SignInFormData): SignInCredentials => ({
  username: formData.username,
  password: formData.password,
});
