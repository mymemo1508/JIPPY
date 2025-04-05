// components/SizeRecipeForm.tsx
import React, { useState } from 'react';
import { Button } from "@/features/common/components/ui/button";
import { Plus, Minus } from 'lucide-react';
import { 
  ProductType, 
  ProductSize, 
  ProductSizeLabel,
  AVAILABLE_SIZES,
  SizeRecipeData 
} from '@/redux/types/product';

interface SizeRecipeFormProps {
  productType: ProductType;
  sizeData: Partial<Record<ProductSize, SizeRecipeData>>;
  onSubmit: (data: Partial<Record<ProductSize, SizeRecipeData>>) => void;
  onCancel: () => void;
}

const SizeRecipeForm = ({ 
  productType, 
  sizeData,
  onSubmit,
  onCancel
}: SizeRecipeFormProps) => {
  const availableSizes = AVAILABLE_SIZES[productType];
  const [formData, setFormData] = useState<Partial<Record<ProductSize, SizeRecipeData>>>(
    () => {
      const initial: Partial<Record<ProductSize, SizeRecipeData>> = {};
      availableSizes.forEach(size => {
        initial[size] = sizeData[size] || {
          price: 0,
          recipe: [{ name: '', amount: 0, unit: 'g' }]
        };
      });
      return initial;
    }
  );

  const handlePriceChange = (size: ProductSize, price: string) => {
    const numericPrice = price.replace(/[^\d]/g, '');
    setFormData(prev => ({
      ...prev,
      [size]: {
        ...prev[size]!,
        price: numericPrice ? parseInt(numericPrice) : 0
      }
    }));
  };

  const handleRecipeChange = (
    size: ProductSize, 
    index: number, 
    field: 'name' | 'amount' | 'unit', 
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [size]: {
        ...prev[size]!,
        recipe: prev[size]!.recipe.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const addRecipeItem = (size: ProductSize) => {
    setFormData(prev => ({
      ...prev,
      [size]: {
        ...prev[size]!,
        recipe: [...prev[size]!.recipe, { name: '', amount: 0, unit: 'g' }]
      }
    }));
  };

  const removeRecipeItem = (size: ProductSize, index: number) => {
    setFormData(prev => ({
      ...prev,
      [size]: {
        ...prev[size]!,
        recipe: prev[size]!.recipe.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {availableSizes.map(size => (
        <div key={size} className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {ProductSizeLabel[size]} 사이즈
          </h3>
          
          {/* 가격 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              가격
            </label>
            <input
              type="text"
              value={formData[size]?.price.toLocaleString()}
              onChange={(e) => handlePriceChange(size, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          {/* 레시피 입력 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                레시피
              </label>
              <button
                type="button"
                onClick={() => addRecipeItem(size)}
                className="text-blue-500 hover:text-blue-700 flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                재료 추가
              </button>
            </div>

            {formData[size]?.recipe.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleRecipeChange(size, index, 'name', e.target.value)}
                  placeholder="재료명"
                  className="flex-1 p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleRecipeChange(size, index, 'amount', parseInt(e.target.value) || 0)}
                  placeholder="용량"
                  className="w-24 p-2 border border-gray-300 rounded"
                  required
                />
                <select
                  value={item.unit}
                  onChange={(e) => handleRecipeChange(size, index, 'unit', e.target.value)}
                  className="w-24 p-2 border border-gray-300 rounded"
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                </select>
                {formData[size]!.recipe.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRecipeItem(size, index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-2 mt-6">
        <Button 
          type="button" 
          variant="orangeBorder" 
          onClick={onCancel}
        >
          이전
        </Button>
        <Button 
          type="submit" 
          variant="orange"
        >
          상품 등록
        </Button>
      </div>
    </form>
  );
};

export default SizeRecipeForm;