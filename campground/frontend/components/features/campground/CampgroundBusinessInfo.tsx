"use client";

interface CampgroundBusinessInfoProps {
  campground: {
    businessName?: string | null;
    businessOwnerName?: string | null;
    address: string;
    businessAddress?: string | null;
    phone?: string | null;
    email?: string | null;
    businessEmail?: string | null;
    website?: string | null;
    businessRegistrationNumber?: string | null;
    tourismBusinessNumber?: string | null;
  };
}

export default function CampgroundBusinessInfo({
  campground,
}: CampgroundBusinessInfoProps) {
  return (
    <section className="border-t border-neutral-200 px-4 py-6">
      <h2 className="mb-4 text-base font-bold">사업자 정보</h2>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="w-24 shrink-0 text-sm text-neutral-600">상호명</span>
          <span className="text-sm text-neutral-900">
            {campground.businessName || "-"}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-24 shrink-0 text-sm text-neutral-600">
            대표자명
          </span>
          <span className="text-sm text-neutral-900">
            {campground.businessOwnerName || "-"}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-24 shrink-0 text-sm text-neutral-600">
            사업자번호
          </span>
          <span className="text-sm text-neutral-900">
            {campground.businessRegistrationNumber || "-"}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-24 shrink-0 text-sm text-neutral-600">
            관광사업번호
          </span>
          <span className="text-sm text-neutral-900">
            {campground.tourismBusinessNumber || "-"}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-24 shrink-0 text-sm text-neutral-600">
            사업장 소재지
          </span>
          <span className="text-sm text-neutral-900">
            {campground.businessAddress || campground.address}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-24 shrink-0 text-sm text-neutral-600">
            전화번호
          </span>
          <span className="text-sm text-neutral-900">
            {campground.phone || "-"}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-24 shrink-0 text-sm text-neutral-600">이메일</span>
          <span className="text-sm text-neutral-900">
            {campground.businessEmail || campground.email || "-"}
          </span>
        </div>
        {campground.website && (
          <div className="flex items-start gap-3">
            <span className="w-24 shrink-0 text-sm text-neutral-600">
              홈페이지
            </span>
            <a
              href={campground.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {campground.website}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
