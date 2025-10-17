export interface BaseResponseListModel<T> {
  resultCode: number;
  resultMessage: string;
  actionResult: T | null;
}