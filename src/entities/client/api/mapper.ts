import type { ClientRegisterRequest, ClientUpdateRequest } from "./dto";
import type { ClientCreate, ClientUpdate } from "../model/types";

import { unformatNumber, trimValue } from "@shared/lib";

export const toRegisterRequest = (vo: ClientCreate): ClientRegisterRequest => ({
  name: trimValue(vo.name),
  bizNumber: unformatNumber(vo.bizNumber),
  representative: trimValue(vo.representative),
  zipcode: vo.zipcode,
  roadAddress: vo.roadAddress,
  detailAddress: trimValue(vo.detailAddress),

  manager: trimValue(vo.manager),
  email: trimValue(vo.email),
  tel: trimValue(vo.tel),
})

export const toUpdateRequest = (vo: ClientUpdate): ClientUpdateRequest => ({
  name: trimValue(vo.name),
  bizNumber: unformatNumber(vo.bizNumber),
  representative: trimValue(vo.representative),
  detailAddress: trimValue(vo.detailAddress),
  zipcode: vo.zipcode,
  roadAddress: vo.roadAddress,

  manager: trimValue(vo.manager),
  email: trimValue(vo.email),
  tel: trimValue(vo.tel),
})
