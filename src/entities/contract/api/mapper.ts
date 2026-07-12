import { trimValue } from '@shared/lib';
import type { ContractRegisterRequest, ContractUpdateRequest } from './dto';
import type { ContractCreate, ContractUpdate } from '../model/types';

export const toRegisterRequest = (vo: ContractCreate): ContractRegisterRequest => ({
  workplaceId: vo.workplaceId,
  contractName: trimValue(vo.contractName),
  contractDate: vo.contractDate,
  startDate: vo.startDate,
  completionDate: vo.completionDate,
  contractAmount: vo.contractAmount,
  contractAmountUnit: vo.contractAmountUnit,
  vatIncluded: vo.vatIncluded,
  contractGuaranteeAmount: vo.contractGuaranteeAmount,
  advancePaymentAmount: vo.advancePaymentAmount,
  advancePaymentDueDate: vo.advancePaymentDueDate,
  delayPenaltyRate: vo.delayPenaltyRate,
  remark: trimValue(vo.remark),
});

export const toUpdateRequest = (vo: ContractUpdate): ContractUpdateRequest => ({
  contractName: trimValue(vo.contractName),
  contractDate: vo.contractDate,
  startDate: vo.startDate,
  completionDate: vo.completionDate,
  contractAmount: vo.contractAmount,
  contractAmountUnit: vo.contractAmountUnit,
  vatIncluded: vo.vatIncluded,
  contractGuaranteeAmount: vo.contractGuaranteeAmount,
  advancePaymentAmount: vo.advancePaymentAmount,
  advancePaymentDueDate: vo.advancePaymentDueDate,
  delayPenaltyRate: vo.delayPenaltyRate,
  remark: trimValue(vo.remark),
});
