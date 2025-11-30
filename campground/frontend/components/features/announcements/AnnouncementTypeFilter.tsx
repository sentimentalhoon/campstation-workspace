"use client";

import {
  ANNOUNCEMENT_TYPE_ICONS,
  ANNOUNCEMENT_TYPE_LABELS,
} from "@/lib/constants";
import type { AnnouncementType } from "@/types";

type AnnouncementTypeFilterProps = {
  selectedType: AnnouncementType | "ALL";
  onTypeChange: (type: AnnouncementType | "ALL") => void;
};

/**
 * 공지사항 타입 필터 컴포넌트
 *
 * @example
 * ```tsx
 * const [selectedType, setSelectedType] = useState<AnnouncementType | "ALL">("ALL");
 *
 * <AnnouncementTypeFilter
 *   selectedType={selectedType}
 *   onTypeChange={setSelectedType}
 * />
 * ```
 */
export function AnnouncementTypeFilter({
  selectedType,
  onTypeChange,
}: AnnouncementTypeFilterProps) {
  const types: Array<AnnouncementType | "ALL"> = [
    "ALL",
    "URGENT",
    "NOTICE",
    "EVENT",
    "FACILITY",
  ];

  const getLabel = (type: AnnouncementType | "ALL") => {
    if (type === "ALL") return "전체";
    return ANNOUNCEMENT_TYPE_LABELS[type];
  };

  const getIcon = (type: AnnouncementType | "ALL") => {
    if (type === "ALL") return "📋";
    return ANNOUNCEMENT_TYPE_ICONS[type];
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            selectedType === type
              ? "border-primary bg-primary text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-primary hover:bg-primary-50"
          }`}
        >
          <span>{getIcon(type)}</span>
          <span>{getLabel(type)}</span>
        </button>
      ))}
    </div>
  );
}
