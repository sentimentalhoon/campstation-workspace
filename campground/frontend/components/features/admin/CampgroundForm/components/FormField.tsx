/**
 * FormField Component
 * Reusable form field with error handling
 */



interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "time" | "number" | "textarea";
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  rows?: number;
  step?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  readonly = false,
  rows = 4,
  step,
}: FormFieldProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue =
      type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(name, newValue);
  };

  const baseClassName = `focus:ring-primary-500 focus:border-primary-500 w-full rounded-lg border px-4 py-2 focus:ring-2 ${
    error ? "border-red-500" : "border-gray-300"
  } ${readonly ? "bg-gray-50" : ""}`;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label} {required && "*"}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          rows={rows}
          className={baseClassName}
          placeholder={placeholder}
          readOnly={readonly}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          className={baseClassName}
          placeholder={placeholder}
          readOnly={readonly}
          step={step}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
