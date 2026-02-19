import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ className, src, alt = "", fallback, size = "md", ...props }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getFallback = () => {
    if (fallback) return fallback.slice(0, 2).toUpperCase();
    if (alt) return alt.slice(0, 2).toUpperCase();
    return "?";
  };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden ring-2 ring-zinc-800 bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-semibold",
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      ) : (
        <span>{getFallback()}</span>
      )}
    </div>
  );
}
