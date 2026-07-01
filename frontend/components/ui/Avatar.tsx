import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const pixelSizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({
  src,
  name,
  alt,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const initial = name?.trim()?.charAt(0).toUpperCase() ?? "?";

  const showFallback = !src || imageError;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-slate-200 text-slate-700 font-medium select-none",
        sizeMap[size],
        className,
      )}
      aria-label={name}
      {...props}
    >
      {!showFallback ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          width={pixelSizeMap[size]}
          height={pixelSizeMap[size]}
          className="object-cover"
          onError={() => setImageError(true)}
          draggable={false}
          priority={size === "lg"}
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </div>
  );
}

Avatar.displayName = "Avatar";
