// components/category/CategoryItem.tsx
import { Button } from "@/features/common/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryItemProps {
  id: number;
  name: string;
  isSelected: boolean;
  isEditMode: boolean;
  onSelect: () => void;
  onLongPress: () => void;
  onPressEnd: () => void;
}

const CategoryItem = ({
  id,
  name,
  isSelected,
  isEditMode,
  onSelect,
  onLongPress,
  onPressEnd,
}: CategoryItemProps) => {
  return (
    <div
      className="relative"
      onMouseDown={onLongPress}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={onLongPress}
      onTouchEnd={onPressEnd}
      onClick={onSelect}
    >
      <Button
        variant={isSelected ? "orange" : "orangeBorder"}
        className={cn(
          "w-[85px] h-[50px] rounded-[15px] font-semibold text-xl flex-shrink-0 mt-0",
          isEditMode && id !== 0 && "animate-shake"
        )}
      >
        {name}
      </Button>
    </div>
  );
};

export default CategoryItem;
