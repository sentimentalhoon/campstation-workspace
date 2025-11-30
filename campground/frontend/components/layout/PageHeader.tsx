"use client";

/**
 * PageHeader 컴포넌트
 *
 * 페이지별 헤더 (뒤로가기, 타이틀, 우측 액션)
 * - Sticky top
 * - 최대 640px
 * - 높이 56px
 *
 * @see docs/specifications/07-COMPONENTS-SPEC.md
 */

type PageHeaderProps = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  showBack = false,
  onBack,
  rightAction,
  className = "",
}: PageHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-neutral-200 bg-white ${className}`}
    >
      <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-4">
        {/* Left: Back Button or Empty */}
        <div className="w-10">
          {showBack && (
            <button
              onClick={handleBack}
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
              aria-label="뒤로가기"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Center: Title */}
        {title && (
          <h1 className="flex-1 truncate px-2 text-center text-lg font-bold text-neutral-900">
            {title}
          </h1>
        )}

        {/* Right: Action or Empty */}
        <div className="flex w-10 justify-end">{rightAction}</div>
      </div>
    </header>
  );
}
