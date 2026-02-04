import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "new" | "hot" | "tonight" | "soldout" | "featured";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    new: "bg-secondary-100 text-secondary-700",
    hot: "bg-primary-100 text-primary-700",
    tonight: "bg-accent-100 text-accent-700",
    soldout: "bg-gray-800 text-white",
    featured: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
