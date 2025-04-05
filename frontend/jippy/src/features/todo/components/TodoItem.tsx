"use client";

import { Trash2 } from "lucide-react";
import { TodoItemProps } from "../types/todo";

const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:border-[#ff5c00] group">
      <div className="flex items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={todo.complete}
          onChange={() => onToggle(todo.id)}
          className="h-4 w-4 accent-[#ff5c00]"
        />
        <span
          className={`${todo.complete ? "line-through text-gray-400" : ""}`}
        >
          {todo.title}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {todo.createdAt.split(" ")[0]}
        </span>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
