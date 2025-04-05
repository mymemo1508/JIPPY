export const styles = {
  form: "space-y-4 p-4 border rounded-lg shadow-md max-w-md mx-auto",
  label: "block text-sm font-medium mb-1",
  input: {
    base: "w-full p-2 border rounded",
    error: "border-red-500",
    normal: "border-gray-300",
  },
  errorText: "text-red-500 text-sm mt-1",
  required: "text-red-500",
  button: {
    primary: "w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300",
  },
} as const;