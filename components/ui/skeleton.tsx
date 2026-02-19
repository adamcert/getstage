import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "text";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const variants = {
    default: "rounded-xl",
    circular: "rounded-full",
    text: "rounded h-4",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-800",
        variants[variant],
        className
      )}
      style={{
        backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
        backgroundSize: "200% 100%",
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s linear infinite",
      }}
      {...props}
    />
  );
}
