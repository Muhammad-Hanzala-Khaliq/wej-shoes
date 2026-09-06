"use client";

/**
 * Reusable Input component with design system integration
 * Uses global .input, .label, .input-error classes from globals.css
 */
export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
          {required && (
            <span style={{ color: "var(--danger)" }} className="ml-0.5">
              *
            </span>
          )}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input ${error ? "input-error" : ""} ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
        {...props}
      />
      {error && (
        <p className="text-sm mt-1" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}