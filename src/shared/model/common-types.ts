export const CONTRACT_STATUS = ['active', 'expiringSoon', 'expired'] as const;

export type ContractStatus = typeof CONTRACT_STATUS[number];

export const GRADE = ['TYPE_1', 'TYPE_2', 'TYPE_3', 'TYPE_4', 'TYPE_5'] as const;

export type Grade = typeof GRADE[number];