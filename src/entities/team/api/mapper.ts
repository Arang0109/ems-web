import type { TeamRegisterRequest, TeamUpdateRequest } from "./dto";
import type { TeamCreate, TeamUpdate } from "../model/types";

import { trimValue } from "@shared/lib";

// Domain(number/string) → DTO: 숫자 id는 passthrough, 문자열만 정규화한다.
const toRequestBody = (vo: TeamCreate): TeamRegisterRequest => ({
  name: trimValue(vo.name),
  mentorUserId: vo.mentorUserId,
  menteeUserId: vo.menteeUserId,
  particleSamplerId: vo.particleSamplerId,
  gasSamplerId: vo.gasSamplerId,
  pitotTubeId: vo.pitotTubeId,
  nozzleId: vo.nozzleId,
});

export const toRegisterRequest = (vo: TeamCreate): TeamRegisterRequest =>
  toRequestBody(vo);

export const toUpdateRequest = (vo: TeamUpdate): TeamUpdateRequest =>
  toRequestBody(vo);
