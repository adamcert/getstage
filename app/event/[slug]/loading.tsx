import { Skeleton } from "@/components/ui/skeleton";

/**
 * Event Detail Page Loading Skeleton
 * Displays skeleton placeholders for the cover image, event info, and ticket sidebar
 */
export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================================================================== */}
      {/* COVER IMAGE SKELETON */}
      {/* ================================================================== */}
      <div className="relative w-full aspect-video md:aspect-[21/9] bg-gray-200">
        <Skeleton className="w-full h-full" />

        {/* Back Button Skeleton */}
        <div className="absolute top-4 left-4">
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>

        {/* Event Info Overlay Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-4xl space-y-4">
            {/* Category Badge */}
            <Skeleton className="h-6 w-24 rounded-full" />

            {/* Title */}
            <Skeleton className="h-10 md:h-14 w-3/4" />

            {/* Quick Info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="w-5 h-5" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="w-5 h-5" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="w-5 h-5" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN CONTENT */}
      {/* ================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ============================================================ */}
          {/* LEFT COLUMN - Event Details */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info Card Skeleton */}
            <EventInfoSkeleton />

            {/* Venue Section Skeleton */}
            <VenueSectionSkeleton />

            {/* Lineup Section Skeleton */}
            <LineupSectionSkeleton />
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN - Sidebar Tickets */}
          {/* ============================================================ */}
          <div className="hidden lg:block">
            <SidebarSkeleton />
          </div>
        </div>
      </div>

      {/* Mobile Floating Button Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-7 w-24" />
          </div>
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Event Info Section Skeleton
 */
function EventInfoSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      {/* Section Title */}
      <Skeleton className="h-7 w-56" />

      {/* Description */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4" />
      </div>

      {/* Music Genres */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Additional Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Venue Section Skeleton
 */
function VenueSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      {/* Section Title */}
      <Skeleton className="h-7 w-24" />

      {/* Venue Info */}
      <div className="flex items-start gap-4">
        {/* Venue Image */}
        <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />

        {/* Venue Details */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton variant="text" className="w-40" />
          <Skeleton variant="text" className="w-32" />
        </div>
      </div>

      {/* Map Placeholder */}
      <Skeleton className="w-full h-48 rounded-xl" />

      {/* Directions Link */}
      <Skeleton className="w-full h-12 rounded-xl" />
    </div>
  );
}

/**
 * Lineup Section Skeleton
 */
function LineupSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      {/* Section Title */}
      <Skeleton className="h-7 w-24" />

      {/* Artists */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
          >
            {/* Artist Avatar */}
            <Skeleton variant="circular" className="w-16 h-16" />

            {/* Artist Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                {i === 0 && <Skeleton className="h-5 w-24 rounded-full" />}
              </div>
              <Skeleton variant="text" className="w-48" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Spotify Button */}
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Sidebar Skeleton (Ticket Selector)
 */
function SidebarSkeleton() {
  return (
    <div className="sticky top-24 space-y-4">
      {/* Price Preview Card */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl p-4">
        <Skeleton className="h-4 w-20 mb-2 bg-white/30" />
        <Skeleton className="h-10 w-32 bg-white/30" />
      </div>

      {/* Ticket Selector Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        {/* Header */}
        <Skeleton className="h-6 w-40" />

        {/* Ticket Types */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
            >
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-6" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total & Button */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
