import type React from "react";

interface PageLoadingProps {
  title?: string;
  description?: string;
  show?: boolean;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  title = "Loading...",
  description = "Please wait while we load the content",
  show = true,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        {/* Loading spinner */}
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
          {description}
        </p>

        {/* Progress bar (optional) */}
        <div className="mt-6 w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 animate-pulse rounded-full"
            style={{
              width: "70%",
              animation: "pulse 1.5s infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PageLoading;
