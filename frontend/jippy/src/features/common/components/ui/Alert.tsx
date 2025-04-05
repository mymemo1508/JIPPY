import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
}

const Alert: React.FC<AlertProps> = ({ 
  children, 
  className,
  variant = "default",
  ...props 
}) => {
  const alertClasses = cn(
    "relative w-full rounded-lg border p-4",
    variant === "destructive" && "border-red-500 text-red-500",
    variant === "default" && "border-gray-200",
    className
  )

  return (
    <div
      role="alert"
      className={alertClasses}
      {...props}
    >
      {variant === "destructive" && (
        <AlertCircle className="absolute left-4 top-4 h-4 w-4" />
      )}
      <div className={cn(variant === "destructive" && "pl-7")}>{children}</div>
    </div>
  )
}

const AlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ 
  children,
  className,
  ...props 
}) => {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h5>
  )
}

const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ 
  children,
  className,
  ...props 
}) => {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Alert, AlertTitle, AlertDescription }