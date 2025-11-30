"use client";

interface CampgroundQuickInfoProps {
  checkInTime: string;
  checkOutTime: string;
  phone: string;
  address: string;
}

export default function CampgroundQuickInfo({
  checkInTime,
  checkOutTime,
  phone,
  address,
}: CampgroundQuickInfoProps) {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50 px-4 py-4">
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-neutral-600">체크인: </span>
          <span className="font-medium">{checkInTime}</span>
        </div>
        <div>
          <span className="text-neutral-600">체크아웃: </span>
          <span className="font-medium">{checkOutTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📞</span>
          <a href={`tel:${phone}`} className="text-primary font-medium">
            {phone}
          </a>
        </div>
        <div className="flex items-start gap-1">
          <span>📍</span>
          <span className="flex-1 text-neutral-700">{address}</span>
        </div>
      </div>
    </section>
  );
}
