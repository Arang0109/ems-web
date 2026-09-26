export type ApiResponseMessage<T> = {
  status: boolean;
  message: string;
  data: T;
}
