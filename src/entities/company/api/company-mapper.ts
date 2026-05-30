import type { CompanyRegisterForm } from "../model/company-types";
import type { CompanyRegisterRequest } from "./company-dtos";

export const mapToDto = (
  form: CompanyRegisterForm
): CompanyRegisterRequest => ({
  ...form,

});