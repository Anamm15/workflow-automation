import * as React from "react";
import { cn } from "@/lib/utils";

export type ErrorTextProps = {
  id?: string;
  error?: string | boolean;
  helperText?: string;
};

export function ErrorText({ id, error, helperText }: ErrorTextProps) {
  if (!error && !helperText) return null;

  const message = typeof error === "string" ? error : helperText;

  return (
    <p
      id={id}
      role={error ? "alert" : undefined}
      aria-live={error ? "polite" : undefined}
      className={cn(
        "text-xs leading-snug",
        error ? "text-danger" : "text-slate-500",
      )}
    >
      {message}
    </p>
  );
}
