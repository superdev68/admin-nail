import { ReactNode } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export function Field({
  label,
  error,
  required,
  help,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  required?: boolean;
  help?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : help ? (
        <p className="mt-1 text-xs text-muted">{help}</p>
      ) : null}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 text-sm font-medium text-ink"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-brand" : "bg-[#d9d6df]"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  error,
}: {
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  error?: boolean;
}) {
  return (
    <select
      className={`input ${error ? "input-error" : ""} ${className}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
