import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = 24 }) => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-24">
      <Loader2 className="animate-spin text-gray-600" size={size} />
    </div>
  );
};

export default LoadingSpinner;