"use client";

type GuestCounterProps = {
  adults: number;
  childrenCount: number;
  onChangeAdults: (count: number) => void;
  onChangeChildren: (count: number) => void;
  maxGuests?: number;
  className?: string;
};

export default function GuestCounter({
  adults,
  childrenCount,
  onChangeAdults,
  onChangeChildren,
  maxGuests = 10,
  className = "",
}: GuestCounterProps) {
  const totalGuests = adults + childrenCount;

  const handleDecrement = (
    type: "adults" | "children",
    currentValue: number
  ) => {
    if (type === "adults") {
      // 성인은 최소 1명
      if (currentValue > 1) {
        onChangeAdults(currentValue - 1);
      }
    } else {
      // 어린이는 최소 0명
      if (currentValue > 0) {
        onChangeChildren(currentValue - 1);
      }
    }
  };

  const handleIncrement = (
    type: "adults" | "children",
    currentValue: number
  ) => {
    // 최대 인원 체크
    if (totalGuests >= maxGuests) {
      return;
    }

    if (type === "adults") {
      onChangeAdults(currentValue + 1);
    } else {
      onChangeChildren(currentValue + 1);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Adults Counter */}
      <div className="flex items-center justify-between border-b border-neutral-200 py-3">
        <div>
          <h3 className="text-base font-bold">성인</h3>
          <p className="text-sm text-neutral-500">만 13세 이상</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDecrement("adults", adults)}
            disabled={adults <= 1}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
              adults <= 1
                ? "cursor-not-allowed border-neutral-200 text-neutral-300"
                : "border-primary text-primary hover:bg-primary/10"
            } `}
            aria-label="성인 인원 감소"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          <span className="w-8 text-center text-lg font-bold">{adults}</span>

          <button
            onClick={() => handleIncrement("adults", adults)}
            disabled={totalGuests >= maxGuests}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
              totalGuests >= maxGuests
                ? "cursor-not-allowed border-neutral-200 text-neutral-300"
                : "border-primary text-primary hover:bg-primary/10"
            } `}
            aria-label="성인 인원 증가"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Children Counter */}
      <div className="flex items-center justify-between border-b border-neutral-200 py-3">
        <div>
          <h3 className="text-base font-bold">어린이</h3>
          <p className="text-sm text-neutral-500">만 12세 이하</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleDecrement("children", childrenCount)}
            disabled={childrenCount <= 0}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
              childrenCount <= 0
                ? "cursor-not-allowed border-neutral-200 text-neutral-300"
                : "border-primary text-primary hover:bg-primary/10"
            } `}
            aria-label="어린이 인원 감소"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          <span className="w-8 text-center text-lg font-bold">
            {childrenCount}
          </span>

          <button
            onClick={() => handleIncrement("children", childrenCount)}
            disabled={totalGuests >= maxGuests}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
              totalGuests >= maxGuests
                ? "cursor-not-allowed border-neutral-200 text-neutral-300"
                : "border-primary text-primary hover:bg-primary/10"
            } `}
            aria-label="어린이 인원 증가"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Guest Limit Info */}
      {maxGuests && (
        <div className="text-sm text-neutral-500">
          총 {totalGuests}명 / 최대 {maxGuests}명
        </div>
      )}
    </div>
  );
}
