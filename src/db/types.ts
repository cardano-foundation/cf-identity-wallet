export interface IResponse {
  success: boolean;
  data: any;
  error?: IError;
}

export interface IError {
  code: number;
  description: string;
}
