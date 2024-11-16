import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Initializing application...</p>
      </div>
    </div>
  );
}
