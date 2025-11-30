/**
 * Category Tabs Component
 * Horizontal scrollable category navigation
 * Graega-style category tabs with smooth scroll
 *
 * Features:
 * - Horizontal scroll on mobile
 * - Active state highlighting
 * - Touch-friendly (min 44px)
 * - Smooth scroll behavior
 * - Links to filtered campground pages
 */

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Category = {
  id: string;
  label: string;
  href: string;
  icon?: string;
};

type CategoryTabsProps = {
  categories: Category[];
  className?: string;
};

export function CategoryTabs({
  categories,
  className = "",
}: CategoryTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <nav
      className={`hide-scrollbar overflow-x-auto ${className}`}
      aria-label="Category navigation"
    >
      <div className="flex gap-2 pb-2">
        {categories.map((category) => {
          const isActive =
            pathname === category.href || currentCategory === category.id;

          return (
            <Link
              key={category.id}
              href={category.href}
              className={`flex min-h-11 shrink-0 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 active:scale-95"
              } `}
              aria-current={isActive ? "page" : undefined}
            >
              {category.icon && (
                <span className="mr-2" aria-hidden="true">
                  {category.icon}
                </span>
              )}
              {category.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
