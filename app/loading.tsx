import { Skeleton } from "@/components/ui/skeleton";

/**
 * Global Loading Component
 * Displays a centered spinner while the main content is loading
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
        </div>

        {/* Loading text */}
        <p className="text-gray-500 font-medium animate-pulse">
          Chargement...
        </p>
      </div>
    </div>
  );
}
