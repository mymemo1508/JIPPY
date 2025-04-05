"use client";

import { useState } from "react";
import TodoItem from "./TodoItem";
import { CheckSquare } from "lucide-react";
import useTodoList from "../hooks/useTodo";
import { Card } from "@/features/common/components/ui/card/Card";

interface TodoListProps {
  storeId: number;
}

const TodoList = ({ storeId }: TodoListProps) => {
  const [showInput, setShowInput] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");

  const { todos, isLoading, handleToggle, handleDelete, handleAddTodo } =
    useTodoList({
      storeId,
    });

  const onAddTodo = async () => {
    if (!newTodoTitle.trim()) return;

    const success = await handleAddTodo(newTodoTitle);
    if (success) {
      setNewTodoTitle("");
      setShowInput(false);
    }
  };

  if (isLoading) return null;
  if (!todos || todos.length === 0) {
    return (
      <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#3D3733]">할 일 목록</h2>
            <button
              onClick={() => setShowInput(true)}
              className="w-8 h-8 flex items-center justify-center text-[24px] text-jippy-orange font-bold rounded hover:bg-orange-50 transition-colors"
            >
              +
            </button>
          </div>
          {showInput ? (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="할 일을 입력하세요"
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-jippy-orange focus:ring-2 focus:ring-[#F27B39]/20"
                onKeyPress={(e) => e.key === "Enter" && onAddTodo()}
              />
              <button
                onClick={onAddTodo}
                className="px-4 py-2 bg-jippy-orange text-white rounded-lg hover:bg-[#D8692E] transition-colors"
              >
                추가
              </button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <CheckSquare className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-center mb-1">등록된 할 일이 없습니다.</p>
              <p className="text-sm text-center text-gray-400">
                새로운 할 일을 추가해주세요.
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#3D3733]">할 일 목록</h2>
            <span className="ml-2 px-2 py-1 bg-[#F27B39]/10 text-jippy-orange rounded-full text-[15px]">
              총 {todos.length}개
            </span>
          </div>
          <button
            onClick={() => setShowInput(!showInput)}
            className="w-8 h-8 flex items-center justify-center text-[24px] text-jippy-orange font-bold rounded hover:bg-orange-50 transition-colors"
          >
            +
          </button>
        </div>

        {showInput && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="할 일을 입력하세요"
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-jippy-orange focus:ring-2 focus:ring-[#F27B39]/20"
              onKeyPress={(e) => e.key === "Enter" && onAddTodo()}
            />
            <button
              onClick={onAddTodo}
              className="px-4 py-2 bg-jippy-orange text-white rounded-lg hover:bg-[#D8692E] transition-colors"
            >
              추가
            </button>
          </div>
        )}

        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TodoList;
