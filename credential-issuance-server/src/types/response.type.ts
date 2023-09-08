export interface IResponseData<T> {
    data: T;
    error?: string;
    success: boolean;
    statusCode: number;
}