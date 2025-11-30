/**
 * AppContainer Component
 * 모바일 전용 컨테이너 (최대 640px)
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type AppContainerProps = {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
};

export const AppContainer = ({
  children,
  className,
  noPadding = false,
}: AppContainerProps) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[640px]",
        !noPadding && "px-4 py-6",
        className
      )}
    >
      {children}
    </div>
  );
};
