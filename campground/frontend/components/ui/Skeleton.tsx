/**
 * 스켈레톤 UI 컴포넌트
 * 로딩 상태를 시각적으로 표현
 */

import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-neutral-100", className)}
      {...props}
    />
  );
}

/**
 * 캠핑장 카드 스켈레톤
 */
export function CampgroundCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-8" />
        </div>
        <Skeleton className="mb-2 h-4 w-1/2" />
        <Skeleton className="mb-3 h-4 w-1/3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * 리뷰 카드 스켈레톤
 */
export function ReviewCardSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="mb-2 h-10 w-full" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/**
 * 사이트 카드 스켈레톤
 */
export function SiteCardSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="mb-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  );
}

/**
 * 리스트 스켈레톤 (반복)
 */
export function ListSkeleton({
  count = 3,
  ItemSkeleton = Skeleton,
  className,
}: {
  count?: number;
  ItemSkeleton?: React.ComponentType;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ItemSkeleton key={i} />
      ))}
    </div>
  );
}
