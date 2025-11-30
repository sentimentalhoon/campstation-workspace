import { AMENITY_ICONS, AMENITY_LABELS } from "@/lib/constants/amenities";

type FacilityGridProps = {
  facilities: string[];
  className?: string;
};

// 한글 레이블 → 영문 키로 매핑 (역매핑)
const labelToKey: Record<string, string> = Object.entries(
  AMENITY_LABELS
).reduce(
  (acc, [key, label]) => {
    acc[label] = key;
    return acc;
  },
  {} as Record<string, string>
);

const defaultIcon = "✓";

export default function FacilityGrid({
  facilities,
  className = "",
}: FacilityGridProps) {
  if (!facilities || facilities.length === 0) {
    return null;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="grid auto-cols-[80px] grid-flow-col grid-rows-2 gap-4 pb-2">
        {facilities.map((facility, index) => {
          // 한글 레이블을 영문 키로 변환 후 아이콘 찾기
          const amenityKey = labelToKey[facility];
          const icon = amenityKey ? AMENITY_ICONS[amenityKey] : defaultIcon;
          return (
            <div
              key={index}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full text-xl">
                {icon}
              </div>
              <span className="text-xs text-neutral-700">{facility}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
