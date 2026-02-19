import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "new" | "hot" | "tonight" | "soldout" | "featured";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-zinc-800 text-zinc-300",
    new: "bg-secondary-500/15 text-secondary-400 border border-secondary-500/30",
    hot: "bg-primary-500/15 text-primary-400 border border-primary-500/30",
    tonight: "bg-accent-500/15 text-accent-400 border border-accent-500/30",
    soldout: "bg-zinc-800 text-zinc-400",
    featured: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
