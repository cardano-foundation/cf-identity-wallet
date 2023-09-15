interface ResponseData<T> {
    data: T;
    error?: string;
    success: boolean;
    statusCode: number;
}

export type {
  ResponseData
}