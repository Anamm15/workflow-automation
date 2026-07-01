"use client";

import { motion, AnimatePresence } from "framer-motion";
import { InputHTMLAttributes, useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, icon, className, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const hasValue = props.value !== undefined && props.value !== "";

    return (
      <div className="relative w-full flex flex-col gap-1">
        <div className={cn("relative rounded-xl transition-all duration-300", error ? "animate-shake" : "")}>
          {/* Ambient Glow on Focus */}
          <div
            className={cn(
              "absolute inset-0 rounded-xl blur-md transition-opacity duration-300 opacity-0 bg-primary/20",
              isFocused && !error && "opacity-100",
              error && "bg-error/20 opacity-100"
            )}
          />

          <div
            className={cn(
              "relative flex items-center bg-background/50 dark:bg-zinc-900/50 backdrop-blur-sm border rounded-xl overflow-hidden transition-colors duration-300",
              isFocused && !error ? "border-primary" : "border-border",
              error ? "border-error" : "",
              className
            )}
          >
            {icon && (
              <div
                className={cn(
                  "pl-4 transition-colors duration-300",
                  isFocused && !error ? "text-primary" : "text-zinc-500 dark:text-zinc-400",
                  error ? "text-error" : ""
                )}
              >
                {icon}
              </div>
            )}
            
            <input
              ref={ref}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                "w-full bg-transparent px-4 py-4 text-foreground outline-none placeholder:text-transparent transition-all",
                icon ? "pl-3" : "",
                props.type === "password" ? "pr-10" : ""
              )}
              {...props}
              type={props.type === "password" && showPassword ? "text" : props.type}
            />

            {props.type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-zinc-500 hover:text-foreground transition-colors outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            {/* Floating Label */}
            <label
              className={cn(
                "absolute left-4 transition-all duration-200 pointer-events-none text-muted-foreground",
                icon ? "left-11" : "",
                (isFocused || hasValue)
                  ? "-translate-y-3 scale-75 text-xs top-[14px] font-medium"
                  : "translate-y-0 scale-100 text-base top-[14px]",
                isFocused && !error ? "text-primary" : "",
                error ? "text-error" : ""
              )}
            >
              {label}
            </label>

            {/* Error Icon */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="pr-4 text-error"
                >
                  <AlertCircle size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-error text-xs font-medium pl-1"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";
