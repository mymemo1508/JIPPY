export interface Todo {
  id: number;
  storeId: number;
  title: string;
  createdAt: string;
  complete: boolean;
}

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export interface TodoRequest {
  page?: number;
  size?: number;
}

export interface CreateTodoRequest {
  title: string;
  complete: boolean;
}

export interface UpdateTodoRequest {
  title?: string;
  complete?: boolean;
}

export interface TodoResponse {
  content: Todo[];
  totalPages: number;
  totalElements: number;
}

export interface TodoApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
