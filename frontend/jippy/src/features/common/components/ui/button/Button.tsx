import { ButtonVariant, buttonVariants } from "./variants";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
}

const Button = ({ 
  children, 
  variant = "default",  // type을 variant로 변경
  onClick,
  className = "",
  disabled = false 
}: ButtonProps) => {
  const baseStyles = variant.includes("Square") 
    ? "rounded-md w-64 transition-colors flex items-center justify-center"
    : "rounded-full w-64 mt-3 p-3 transition-colors flex items-center justify-center";
  
  const buttonStyle = cn(
    baseStyles,
    buttonVariants[variant],  // type을 variant로 변경
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <button 
      className={buttonStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;