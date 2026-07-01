import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";
import { ErrorText } from "./ErrorText";

export interface FormFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  error?: string | boolean;
  helperText?: string;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: React.ReactElement<any>;
}

export function FormField({
  label,
  required,
  error,
  helperText,
  className,
  children,
}: FormFieldProps) {
  const fieldId = React.useId();

  const control = React.cloneElement(children, {
    id: children.props.id ?? fieldId,
    error,
    "aria-invalid": !!error,
    "aria-describedby": helperText || error ? `${fieldId}-desc` : undefined,
  });

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}

      {control}

      <ErrorText id={`${fieldId}-desc`} error={error} helperText={helperText} />
    </div>
  );
}
