import { useState, useEffect, useCallback } from "react";
import { Todo } from "../types/todo";
import todoApi from "./todoApi";

interface UseTodoListProps {
  storeId: number;
  onScrollChange?: (scrolled: boolean) => void;
}

const useTodoList = ({ storeId, onScrollChange }: UseTodoListProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await todoApi.getTodos(storeId);
      console.log("API Response:", response);

      if (response.success && Array.isArray(response.data)) {
        setTodos(response.data);
      } else {
        throw new Error(
          response.message || "할 일 목록을 불러오는데 실패했습니다"
        );
      }
    } catch (error) {
      setError("할 일 목록을 불러오는데 실패했습니다");
      console.error("할 일 목록 로딩 실패:", error);
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  const handleScroll = useCallback(() => {
    if (onScrollChange) {
      const scrolled = window.scrollY > 200;
      onScrollChange(scrolled);
    }
  }, [onScrollChange]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleToggle = async (todoId: number) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === todoId);
      if (!todoToUpdate) return;

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === todoId ? { ...todo, complete: !todo.complete } : todo
        )
      );

      const response = await todoApi.updateTodo(storeId, todoId, {
        title: todoToUpdate.title,
        complete: !todoToUpdate.complete,
      });

      if (!response.success) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === todoId
              ? { ...todo, complete: todoToUpdate.complete }
              : todo
          )
        );
        throw new Error("상태 업데이트에 실패했습니다");
      }
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      alert("상태 업데이트에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDelete = async (todoId: number) => {
    try {
      const response = await todoApi.deleteTodo(storeId, todoId);
      if (response.success) {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId));
        return true;
      }
      throw new Error("할 일 삭제에 실패했습니다");
    } catch (error) {
      console.error("할 일 삭제 실패:", error);
      alert("할 일 삭제에 실패했습니다. 다시 시도해주세요.");
      return false;
    }
  };

  const handleAddTodo = async (title: string) => {
    try {
      const response = await todoApi.createTodo(storeId, {
        title: title.trim(),
        complete: false,
      });

      if (response.success) {
        await fetchTodos();
        return true;
      }
      throw new Error("할 일 추가에 실패했습니다");
    } catch (error) {
      console.error("할 일 추가 실패:", error);
      alert("할 일 추가에 실패했습니다. 다시 시도해주세요.");
      return false;
    }
  };

  return {
    todos,
    isLoading,
    error,
    handleToggle,
    handleDelete,
    handleAddTodo,
  };
};
export default useTodoList;
