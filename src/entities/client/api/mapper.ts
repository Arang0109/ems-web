import type { ClientRegisterRequest, ClientUpdateRequest } from "./dto";
import type { ClientCreate, ClientUpdate } from "../model/types";


export const toRegisterRequest = (vo: ClientCreate): ClientRegisterRequest => ({
  name: vo.name,
  bizNumber: vo.bizNumber,
  representative: vo.representative,
  zipcode: vo.zipcode,
  roadAddress: vo.roadAddress,
  detailAddress: vo.detailAddress,

  manager: vo.manager,
  email: vo.email,
  tel: vo.tel,
})

export const toUpdateRequest = (vo: ClientUpdate): ClientUpdateRequest => ({
  name: vo.name,
  bizNumber: vo.bizNumber,
  representative: vo.representative,
  detailAddress: vo.detailAddress,
  zipcode: vo.zipcode,
  roadAddress: vo.roadAddress,

  manager: vo.manager,
  email: vo.email,
  tel: vo.tel,
})
