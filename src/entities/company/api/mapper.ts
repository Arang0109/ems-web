import type { CompanyRegisterRequest, CompanyUpdateRequest } from "./dto";
import type { CompanyCreate, CompanyUpdate } from "../model/types";

import { unformatNumber, trimValue } from "@shared/lib";

export const toRegisterRequest = (vo: CompanyCreate): CompanyRegisterRequest => ({
  name: trimValue(vo.name),
  bizNumber: unformatNumber(vo.bizNumber),
  representative: trimValue(vo.representative),
  address: trimValue(vo.address),

  manager: trimValue(vo.manager),
  email: trimValue(vo.email),
  tel: trimValue(vo.tel),
})

export const toUpdateRequest = (vo: CompanyUpdate): CompanyUpdateRequest => ({
  name: trimValue(vo.name),
  bizNumber: unformatNumber(vo.bizNumber),
  representative: trimValue(vo.representative),
  address: trimValue(vo.address),

  manager: trimValue(vo.manager),
  email: trimValue(vo.email),
  tel: trimValue(vo.tel),
})
