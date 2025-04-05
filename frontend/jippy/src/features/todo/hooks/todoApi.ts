import { CreateTodoRequest, Todo, UpdateTodoRequest } from "../types/todo";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface TodoApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const todoApi = {
  getTodos: async (storeId: number): Promise<TodoApiResponse<Todo[]>> => {
    try {
      const response = await fetch(`${BASE_URL}/api/todo/${storeId}/select`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      const todos = Array.isArray(data) ? data : [];

      return { success: true, data: todos };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
        data: [],
      };
    }
  },

  createTodo: async (
    storeId: number,
    data: CreateTodoRequest
  ): Promise<TodoApiResponse<Todo>> => {
    try {
      console.log("Request payload:", {
        title: data.title,
        complete: data.complete,
      });

      const response = await fetch(`${BASE_URL}/api/todo/${storeId}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          complete: false,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(errorText || "Failed to create todo");
      }

      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "할 일 추가에 실패했습니다",
      };
    }
  },

  updateTodo: async (
    storeId: number,
    todoId: number,
    data: UpdateTodoRequest
  ): Promise<TodoApiResponse<Todo>> => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/todo/${storeId}/update/${todoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: data.title,
            complete: data.complete,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "할 일 수정에 실패했습니다",
      };
    }
  },

  deleteTodo: async (
    storeId: number,
    todoId: number
  ): Promise<TodoApiResponse<void>> => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/todo/${storeId}/delete/${todoId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "할 일 삭제에 실패했습니다",
      };
    }
  },
};

export default todoApi;
