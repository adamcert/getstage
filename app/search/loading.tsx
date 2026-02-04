import { Skeleton } from "@/components/ui/skeleton";

/**
 * Search Page Loading Skeleton
 * Displays skeleton placeholders for the search header, filters, and event cards grid
 */
export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================== */}
      {/* HEADER SKELETON */}
      {/* ================================================================== */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Title Skeleton */}
          <Skeleton className="h-8 w-64 mb-4" />

          {/* Search Input Skeleton */}
          <Skeleton className="h-14 w-full max-w-2xl rounded-2xl" />
        </div>
      </div>

      {/* ================================================================== */}
      {/* FILTERS SKELETON */}
      {/* ================================================================== */}
      <div className="sticky top-[120px] md:top-[140px] z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Filter Pills Skeleton */}
            <div className="hidden md:flex items-center gap-3 flex-1">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>

            {/* Mobile Filter Trigger Skeleton */}
            <Skeleton className="md:hidden h-10 w-28 rounded-xl" />

            {/* Results Counter Skeleton */}
            <Skeleton className="hidden sm:block h-5 w-40" />
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* CONTENT SKELETON - Events Grid */}
      {/* ================================================================== */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Mobile Results Counter Skeleton */}
        <Skeleton className="sm:hidden h-4 w-32 mb-4" />

        {/* Events Grid Skeleton - 6 items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

/**
 * Event Card Skeleton Component
 */
function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[16/10] w-full" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Badges */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />

        {/* Date & Location */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-4 h-4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
