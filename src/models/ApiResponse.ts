export interface ApiResponse<T> {
  resultCode: number;
  resultMessage: string;
  data: T | null;
}