import { Loader } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin text-gray-300 dark:text-gray-700 mx-auto mb-4" />
      </div>
    </div>
  );
}
