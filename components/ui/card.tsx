import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "elevated";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variants = {
    default: "bg-zinc-900 rounded-2xl border border-zinc-800",
    interactive: "bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all duration-200 cursor-pointer",
    elevated: "bg-zinc-900 rounded-2xl border border-zinc-800 shadow-lg shadow-black/20",
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}
