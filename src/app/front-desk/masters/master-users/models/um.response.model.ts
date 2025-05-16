export interface UMResponse<T> {
    data: T;
    message?: string;
    total: number;
    status: boolean;
    errors?: string[];
}
