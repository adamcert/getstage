import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard Page Loading Skeleton
 * Displays skeleton placeholders for stats cards and events table
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* ================================================================== */}
      {/* PAGE HEADER SKELETON */}
      {/* ================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>

      {/* ================================================================== */}
      {/* STATS CARDS SKELETON */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* ================================================================== */}
      {/* EVENTS SECTION SKELETON */}
      {/* ================================================================== */}
      <div>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-11 w-full sm:w-72 rounded-xl" />
        </div>

        {/* Events Table Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="grid grid-cols-5 gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <MobileEventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stats Card Skeleton
 */
function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <Skeleton className="w-12 h-12 rounded-xl" />

        {/* Content */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton (Desktop)
 */
function TableRowSkeleton() {
  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-5 gap-4 items-center">
        {/* Event Info */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-12 rounded-lg flex-shrink-0" />
          <div className="space-y-1 min-w-0">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Date */}
        <Skeleton className="h-4 w-32" />

        {/* Status */}
        <Skeleton className="h-6 w-20 rounded-full" />

        {/* Tickets Sold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile Event Card Skeleton
 */
function MobileEventCardSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-start gap-4">
        {/* Image */}
        <Skeleton className="w-20 h-14 rounded-lg flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="w-9 h-9 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
