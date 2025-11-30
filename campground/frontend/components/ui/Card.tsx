/**
 * Card Component
 * 재사용 가능한 카드 컴포넌트
 */

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Card 컴포넌트의 Props 타입
 */
type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** 카드 내용 */
  children: ReactNode;
  /** 호버 효과 활성화 여부 */
  hover?: boolean;
  /** 내부 패딩 크기 */
  padding?: "none" | "sm" | "md" | "lg";
};

/**
 * Card 컴포넌트
 *
 * @description 콘텐츠를 그룹화하고 시각적으로 구분하는 카드 컨테이너
 *
 * @param {CardProps} props - 카드 속성
 * @param {ReactNode} props.children - 카드 내용
 * @param {boolean} [props.hover=false] - 호버 시 그림자 효과
 * @param {"none" | "sm" | "md" | "lg"} [props.padding="md"] - 내부 패딩
 *
 * @example
 * ```tsx
 * // 기본 카드
 * <Card>
 *   <CardHeader>
 *     <CardTitle>제목</CardTitle>
 *   </CardHeader>
 *   <CardContent>내용</CardContent>
 * </Card>
 *
 * // 호버 효과와 커스텀 패딩
 * <Card hover padding="lg">
 *   <p>큰 패딩과 호버 효과</p>
 * </Card>
 * ```
 */
export const Card = ({
  children,
  hover = false,
  padding = "md",
  className,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        "border-border bg-background rounded-lg border shadow-sm",
        hover && "transition-shadow hover:shadow-md",
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

// Card Header
type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const CardHeader = ({
  children,
  className,
  ...props
}: CardHeaderProps) => {
  return (
    <div className={cn("flex flex-col space-y-1.5", className)} {...props}>
      {children}
    </div>
  );
};

// Card Title
type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

export const CardTitle = ({
  children,
  as: Component = "h3",
  className,
  ...props
}: CardTitleProps) => {
  return (
    <Component
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Description
type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

export const CardDescription = ({
  children,
  className,
  ...props
}: CardDescriptionProps) => {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props}>
      {children}
    </p>
  );
};

// Card Content
type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const CardContent = ({
  children,
  className,
  ...props
}: CardContentProps) => {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
};

// Card Footer
type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const CardFooter = ({
  children,
  className,
  ...props
}: CardFooterProps) => {
  return (
    <div className={cn("flex items-center pt-0", className)} {...props}>
      {children}
    </div>
  );
};
