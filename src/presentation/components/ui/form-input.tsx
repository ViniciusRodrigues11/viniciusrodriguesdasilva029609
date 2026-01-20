import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormInput({
  label,
  error,
  required = false,
  className,
  id,
  ...props
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label} {required && "*"}
      </label>
      <input
        id={id}
        {...props}
        className={`mt-1 w-full rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-500"
            : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-500"
        } ${className || ""}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
