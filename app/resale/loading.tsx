import { Skeleton } from "@/components/ui/skeleton";

/**
 * Resale Page Loading Skeleton
 * Displays skeleton placeholders for the hero section, filters, and ticket cards grid
 */
export default function ResaleLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================== */}
      {/* HEADER SKELETON */}
      {/* ================================================================== */}
      <div className="bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Trust Badge */}
            <Skeleton className="h-9 w-48 rounded-full mx-auto mb-6 bg-white/20" />

            {/* Title */}
            <Skeleton className="h-12 md:h-16 w-3/4 mx-auto mb-6 bg-white/30" />

            {/* Description */}
            <Skeleton className="h-6 w-full max-w-xl mx-auto mb-2 bg-white/20" />
            <Skeleton className="h-6 w-3/4 max-w-lg mx-auto mb-8 bg-white/20" />

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-10 w-16 mx-auto mb-2 bg-white/30" />
                  <Skeleton className="h-4 w-24 mx-auto bg-white/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FILTERS SKELETON */}
      {/* ================================================================== */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input Skeleton */}
            <Skeleton className="h-12 flex-1 rounded-xl" />

            {/* Filter Selects */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
              <Skeleton className="h-12 w-full sm:w-40 rounded-xl" />
            </div>
          </div>

          {/* Results Count */}
          <Skeleton className="h-4 w-40 mt-3" />
        </div>
      </div>

      {/* ================================================================== */}
      {/* TICKETS GRID SKELETON */}
      {/* ================================================================== */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ResaleTicketCardSkeleton key={i} />
          ))}
        </div>
      </main>

      {/* ================================================================== */}
      {/* HOW IT WORKS SECTION SKELETON */}
      {/* ================================================================== */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 max-w-full mx-auto" />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <HowItWorksStepSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* CTA SECTION SKELETON */}
      {/* ================================================================== */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gray-200 rounded-2xl p-8 md:p-12">
            <div className="text-center">
              <Skeleton className="h-8 w-80 max-w-full mx-auto mb-4" />
              <Skeleton className="h-5 w-full max-w-xl mx-auto mb-2" />
              <Skeleton className="h-5 w-3/4 max-w-md mx-auto mb-6" />
              <Skeleton className="h-11 w-44 mx-auto rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Resale Ticket Card Skeleton
 */
function ResaleTicketCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Image Container */}
      <div className="relative">
        <Skeleton className="aspect-[16/10] w-full" />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-7 w-14 rounded-md" />
        </div>

        {/* Ticket Type Badge */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-4 h-4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Price Section */}
        <div className="pt-3">
          <div className="flex items-end justify-between mb-3">
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-2">
              <Skeleton variant="circular" className="w-8 h-8" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Buy Button */}
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * How It Works Step Skeleton
 */
function HowItWorksStepSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
      <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-2xl" />
      <Skeleton className="h-6 w-40 mx-auto mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mx-auto" />
    </div>
  );
}
