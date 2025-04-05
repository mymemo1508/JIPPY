export interface ApiResponse<T> {
    code: number;
    success: boolean;
    data: T;
    message: string;
}

export interface Feedback {
    id: number;
    storeId: number;
    category: string;
    content: string;
    createdAt: string;
}