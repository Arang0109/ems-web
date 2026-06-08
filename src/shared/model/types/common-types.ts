export const CONTRACT_STATUS = ['active', 'expiringSoon', 'expired'] as const;
export const GRADE = ['TYPE_1', 'TYPE_2', 'TYPE_3', 'TYPE_4', 'TYPE_5'] as const;
export const ORIENTATION = ['VERTICAL', 'HORIZONTAL'] as const;
export const SHAPE = ['CIRCULAR', 'RECTANGULAR'] as const;
export const MEASUREMENT_FIELD = ['AIR', 'WATER', 'NOISE_VIBRATION', 'ODOR'] as const;
export const MEASUREMENT_METHOD = ['DUST', 'HEAVY_METAL', 'MERCURY', 'FIELD_MEASUREMENT', 'ABSORPTION_SOLUTION', 'ADSORPTION_TUBE', 'TEDLAR_BAG', 'CARTRIDGE'] as const;
export const POLLUTANT_PHASE = ['PARTICLE', 'GAS'] as const;

export type ContractStatus = typeof CONTRACT_STATUS[number];
export type Grade = typeof GRADE[number];
export type Orientation = typeof ORIENTATION[number];
export type Shape = typeof SHAPE[number];
export type MeasurementField = typeof MEASUREMENT_FIELD[number];
export type MeasurementMethod = typeof MEASUREMENT_METHOD[number];
export type PollutantPhase = typeof POLLUTANT_PHASE[number];