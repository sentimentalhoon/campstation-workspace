/**
 * Tabs Component
 * 콘텐츠를 여러 탭으로 구분하여 표시
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="info" onChange={setActiveTab}>
 *   <TabsList>
 *     <TabsTrigger value="info">정보</TabsTrigger>
 *     <TabsTrigger value="reviews">리뷰</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="info">정보 내용</TabsContent>
 *   <TabsContent value="reviews">리뷰 내용</TabsContent>
 * </Tabs>
 * ```
 */

"use client";

import { cn } from "@/lib/utils";
import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/**
 * Tabs Context 타입
 */
type TabsContextValue = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Tabs Context
 */
const TabsContext = createContext<TabsContextValue | undefined>(undefined);

/**
 * Tabs Hook
 */
function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compound components must be used within Tabs");
  }
  return context;
}

/**
 * Tabs 컴포넌트 Props
 */
type TabsProps = HTMLAttributes<HTMLDivElement> & {
  /** 기본 활성 탭 */
  defaultValue?: string;
  /** 현재 활성 탭 (제어 컴포넌트) */
  value?: string;
  /** 탭 변경 핸들러 */
  onChange?: (value: string) => void;
  /** 자식 요소 */
  children: ReactNode;
};

/**
 * Tabs 컴포넌트
 *
 * @description 탭 UI의 루트 컴포넌트입니다.
 */
export function Tabs({
  defaultValue = "",
  value: controlledValue,
  onChange: controlledOnChange,
  children,
  className,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const onChange = isControlled ? controlledOnChange! : setUncontrolledValue;

  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/**
 * TabsList 컴포넌트 Props
 */
type TabsListProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;
};

/**
 * TabsList 컴포넌트
 *
 * @description 탭 버튼들의 컨테이너입니다.
 */
export function TabsList({
  children,
  fullWidth = false,
  className,
  ...props
}: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-gray-100 p-1",
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * TabsTrigger 컴포넌트 Props
 */
type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 탭 값 */
  value: string;
  /** 자식 요소 */
  children: ReactNode;
};

/**
 * TabsTrigger 컴포넌트
 *
 * @description 개별 탭 버튼입니다.
 */
export function TabsTrigger({
  value: triggerValue,
  children,
  disabled,
  className,
  ...props
}: TabsTriggerProps) {
  const { value, onChange } = useTabs();
  const isActive = value === triggerValue;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => onChange(triggerValue)}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 whitespace-nowrap",
        "text-sm font-medium transition-all",
        "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:text-gray-900",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * TabsContent 컴포넌트 Props
 */
type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  /** 탭 값 */
  value: string;
  /** 자식 요소 */
  children: ReactNode;
  /** 애니메이션 사용 여부 */
  animated?: boolean;
};

/**
 * TabsContent 컴포넌트
 *
 * @description 탭 콘텐츠 영역입니다.
 */
export function TabsContent({
  value: contentValue,
  children,
  animated = true,
  className,
  ...props
}: TabsContentProps) {
  const { value } = useTabs();
  const isActive = value === contentValue;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-4",
        animated && "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
