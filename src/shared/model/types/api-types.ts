export type ApiResponseMessage<T> = {
  status: boolean;
  message: string;
  data: T;
}

export type FieldErrorResponse = {
  field: string;
  message: string;
}