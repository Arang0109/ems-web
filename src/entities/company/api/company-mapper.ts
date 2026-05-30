import type { CompanyRegisterForm } from "./company-form";
import type { CompanyRegisterRequest } from "./company-types";

export const mapToDto = (
  form: CompanyRegisterForm
): CompanyRegisterRequest => ({
  ...form,

});