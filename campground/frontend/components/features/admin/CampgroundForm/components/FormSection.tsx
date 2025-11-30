/**
 * FormSection Component
 * Reusable section wrapper
 */

import  { type ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  variant?: "default" | "admin";
}

export function FormSection({
  title,
  children,
  variant = "default",
}: FormSectionProps) {
  const className =
    variant === "admin"
      ? "rounded-lg border border-yellow-200 bg-yellow-50 p-6"
      : "rounded-lg bg-white p-6 shadow-sm";

  return (
    <section className={className}>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
