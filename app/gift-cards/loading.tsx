import { Skeleton } from "@/components/ui/skeleton";

/**
 * Gift Cards Page Loading Skeleton
 * Displays skeleton placeholders for the gift card configuration form and preview
 */
export default function GiftCardsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ================================================================== */}
        {/* HEADER SKELETON */}
        {/* ================================================================== */}
        <div className="text-center mb-12">
          {/* Icon */}
          <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-6" />

          {/* Title */}
          <Skeleton className="h-10 w-64 mx-auto mb-4" />

          {/* Description */}
          <Skeleton className="h-6 w-full max-w-xl mx-auto mb-1" />
          <Skeleton className="h-6 w-3/4 max-w-md mx-auto" />
        </div>

        {/* ================================================================== */}
        {/* MAIN CONTENT - 2 Column Layout */}
        {/* ================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ============================================================ */}
          {/* LEFT COLUMN - Configuration */}
          {/* ============================================================ */}
          <div className="space-y-8">
            {/* Amount Section */}
            <AmountSectionSkeleton />

            {/* Design Section */}
            <DesignSectionSkeleton />

            {/* Recipient Section */}
            <RecipientSectionSkeleton />

            {/* Send Date Section */}
            <SendDateSectionSkeleton />

            {/* Mobile Submit Button */}
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN - Preview (Sticky) */}
          {/* ============================================================ */}
          <div className="lg:sticky lg:top-8 space-y-6 self-start">
            {/* Preview Card */}
            <PreviewSectionSkeleton />

            {/* Summary & Purchase - Desktop */}
            <SummarySectionSkeleton />

            {/* Trust Badges */}
            <TrustBadgesSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Amount Section Skeleton
 */
function AmountSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Preset Amounts Grid */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>

      {/* Custom Amount */}
      <Skeleton className="h-16 w-full rounded-xl mb-3" />

      {/* Info Text */}
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  );
}

/**
 * Design Section Skeleton
 */
function DesignSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Design Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="aspect-[1.4/1] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Recipient Section Skeleton
 */
function RecipientSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Recipient Name Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Sender Name Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Send Date Section Skeleton
 */
function SendDateSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Preview Section Skeleton
 */
function PreviewSectionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Gift Card Preview */}
      <Skeleton className="aspect-[1.6/1] w-full max-w-md mx-auto rounded-3xl" />

      {/* Message Preview */}
      <Skeleton className="h-20 w-full mt-4 rounded-xl" />
    </div>
  );
}

/**
 * Summary Section Skeleton (Desktop)
 */
function SummarySectionSkeleton() {
  return (
    <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Summary */}
      <div className="p-6 space-y-4">
        <Skeleton className="h-5 w-20" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Total & Button */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />

        {/* Validation Status */}
        <Skeleton className="h-12 w-full mt-4 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Trust Badges Skeleton
 */
function TrustBadgesSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}
