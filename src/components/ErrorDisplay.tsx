import { useTranslation } from "react-i18next";

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8 max-w-md">
        <div className="text-red-500 text-xl mb-4">
          ⚠️ {t("common.error")}
        </div>
        <p className="text-gray-700">{message}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          {t("common.retry")}
        </button>
      </div>
    </div>
  );
}
