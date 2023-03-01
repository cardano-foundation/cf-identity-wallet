export interface IResponse {
  success: boolean;
  data?: any;
  error?: IError;
}

export interface IError {
  docId?: string,
  error?: boolean,
  id?: string,
  message?: string,
  name?: string,
  status: number,
  description?: string;
}
