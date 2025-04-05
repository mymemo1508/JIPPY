export const buttonVariants = {
  default: "bg-gray-100 hover:bg-gray-200 text-gray-800",
  primary: "bg-blue-500 hover:bg-blue-600 text-white",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  orange: "bg-jippy-orange hover:bg-orange-600 text-white",
  orangeBorder: "bg-white border-2 border-jippy-orange text-jippy-brown hover:bg-orange-50",
  brown: "bg-jippy-brown hover:bg-amber-900 text-white",
  orangeSquare: "bg-jippy-orange hover:bg-orange-600 text-white h-12 px-6 py-2 min-w-[100px] flex items-center justify-center text-base",
  brownSquare: "bg-jippy-brown hover:bg-amber-900 text-white h-12 px-6 py-2 min-w-[100px] flex items-center justify-center text-base"
} as const;

export type ButtonVariant = keyof typeof buttonVariants;