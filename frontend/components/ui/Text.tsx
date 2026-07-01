import * as React from "react";
import { cn } from "@/lib/utils";

export type TextSize =
  | "caption"
  | "body"
  | "subtitle"
  | "title"
  | "heading"
  | "display";

export type TextColor =
  | "default"
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  size?: TextSize;
  color?: TextColor;
  weight?: "normal" | "medium" | "semibold" | "bold";
}

const sizeStyles: Record<TextSize, string> = {
  /**
   * Very small helper / meta text
   * 12 → 12
   */
  caption: "text-xs",

  /**
   * Default paragraph text
   * Mobile: 14
   * Desktop: 16
   */
  body: "text-sm lg:text-base",

  /**
   * Section subtitle
   * Mobile: 15
   * Desktop: 18
   */
  subtitle: "text-[15px] lg:text-lg",

  /**
   * Card / Section title
   * Mobile: 18
   * Desktop: 20
   */
  title: "text-lg lg:text-xl",

  /**
   * Page heading
   * Mobile: 20
   * Desktop: 24
   */
  heading: "text-xl lg:text-2xl",

  /**
   * Hero / Landing display text
   * Mobile: 28
   * Desktop: 36
   */
  display: "text-3xl lg:text-4xl",
};

const colorStyles: Record<TextColor, string> = {
  default: "text-[var(--color-foreground)]",
  muted: "text-slate-500",
  primary: "text-[var(--color-primary)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  danger: "text-[var(--color-danger)]",
};

const weightStyles = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export function Text({
  as: Component = "p",
  size = "body",
  color = "default",
  weight = "normal",
  className,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(
        "leading-relaxed",
        sizeStyles[size],
        colorStyles[color],
        weightStyles[weight],
        className,
      )}
      {...props}
    />
  );
}
