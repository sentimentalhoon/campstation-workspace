/**
 * SearchBar Component
 * Sticky search bar with click-to-navigate behavior
 * React 19+ with React Compiler auto-optimization
 */

import { ROUTES } from "@/lib/constants";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();

  return (
    <section className="bg-card pt-safe sticky top-0 z-10 shadow-sm">
      <div className="container-mobile py-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="여행 일정이 맞는 숙소를 검색해보세요!"
            className="border-border bg-muted/50 placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12 w-full rounded-full border pr-4 pl-12 text-sm focus:ring-2 focus:outline-none"
            onClick={() => router.push(ROUTES.CAMPGROUNDS.LIST)}
            readOnly
          />
        </div>
      </div>
    </section>
  );
}
