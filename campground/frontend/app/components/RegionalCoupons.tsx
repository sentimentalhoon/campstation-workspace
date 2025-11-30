/**
 * RegionalCoupons Component
 * Section showing regional discount coupons
 * React 19+ with React Compiler auto-optimization
 */

import { Image } from "@/components/ui";

export function RegionalCoupons() {
  return (
    <section className="container-mobile bg-card py-2">
      <div className="mb-4">
        <h2 className="text-foreground text-xl font-bold">지역사랑 할인쿠폰</h2>
        <p className="text-muted-foreground text-sm">
          숙소 예약자에게 드리는 특별한 혜택!
        </p>
      </div>

      <div className="border-warning/50 bg-warning/10 rounded-xl border-2 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-bold">가평</h3>
        </div>

        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card w-64 shrink-0 overflow-hidden rounded-lg shadow-sm"
            >
              <Image
                src="/images/fallback-image.svg"
                alt="쿠폰 이미지"
                width={256}
                height={144}
                aspectRatio="video"
                objectFit="cover"
                rounded="none"
                className="bg-muted"
                unoptimized
              />
              <div className="p-3">
                <h4 className="text-foreground font-semibold">
                  할인 캠핑장 {i}
                </h4>
                <p className="text-destructive mt-1 text-sm font-bold">
                  최대 7,000원 할인
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
