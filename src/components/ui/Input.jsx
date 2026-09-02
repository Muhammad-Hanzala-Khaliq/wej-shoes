"use client";

/**
 * Reusable Input component with label and error state
 * @param {Object} props
 * @param {string} [props.label] - Input label text
 * @param {string} [props.type="text"] - Input type
 * @param {string} props.name - Input name (required)
 * @param {*} [props.value] - Input value
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.required=false] - Required state
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className=""] - Additional CSS classes
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
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
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
        className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }
          focus:outline-none focus:ring-1
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
        `}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
