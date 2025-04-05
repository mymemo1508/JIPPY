// @/features/dashboard/product/components/RecipeForm.tsx
"use client";
import React, { useState, useEffect } from "react";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface RecipeFormProps {
  productId: number;
  mode: "create" | "edit";
}

const RecipeForm: React.FC<RecipeFormProps> = ({ productId, mode }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: 0, unit: "" },
  ]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const storeId = 1;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/recipe/list/ingredient?storeId=${storeId}&productId=${productId}`
        );
        const json = await response.json();
        if (json.success && json.data && json.data.length > 0) {
          setIngredients(json.data);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };
    if (mode === "edit") {
      fetchRecipe();
    }
  }, [mode, productId]);

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: field === "amount" ? Number(value) : value,
    };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: 0, unit: "" }]);
  };

  const handleSubmitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmptyRecipe = ingredients.every((ing) => ing.name === "");
    let url = "";
    let method = "";
    if (mode === "create" || (mode === "edit" && isEmptyRecipe)) {
      url = `${process.env.NEXT_PUBLIC_API_URL}/api/recipe/create`;
      method = "POST";
    } else {
      url = `${process.env.NEXT_PUBLIC_API_URL}/api/recipe/update`;
      method = "PUT";
    }
    const payload = {
      productId,
      updatedAt: new Date().toISOString(),
      ingredient: ingredients,
    };
    try {
      let response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.status === 404 && method === "PUT") {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipe/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const jsonResponse = await response.json();
      if (jsonResponse.success) {
        alert("레시피가 저장되었습니다.");
        window.location.reload();
      } else {
        alert("레시피 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  const handleDeleteRecipe = async () => {
    if (confirm("레시피를 삭제하시겠습니까?")) {
      try {
        const storeId = 1;
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/recipe/delete`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, storeId }),
          }
        );
        const jsonResponse = await response.json();
        if (jsonResponse.success) {
          alert("레시피가 삭제되었습니다.");
          setIngredients([{ name: "", amount: 0, unit: "" }]);
          window.location.reload();
        }
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmitRecipe} className="space-y-4">
      {ingredients.map((ingredient, index) => (
        <div key={index} className="flex space-x-2 mb-2">
          <input
            type="text"
            placeholder="재료명"
            value={ingredient.name}
            onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
            className="border p-2 rounded flex-1"
            required
          />
          <input
            type="number"
            placeholder="수량"
            value={ingredient.amount || ""}
            onChange={(e) => handleIngredientChange(index, "amount", e.target.value)}
            className="border p-2 rounded w-20"
            required
          />
          <input
            type="text"
            placeholder="단위"
            value={ingredient.unit}
            onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
            className="border p-2 rounded w-20"
            required
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={addIngredient}
          className="bg-gray-300 px-2 py-1 rounded"
        >
          재료 추가
        </button>
        <button
          type="submit"
          className="bg-[#F27B39] text-white px-4 py-2 rounded"
        >
          레시피 저장
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDeleteRecipe}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            레시피 삭제
          </button>
        )}
      </div>
    </form>
  );
};

export default RecipeForm;
