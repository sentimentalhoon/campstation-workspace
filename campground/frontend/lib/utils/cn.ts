import { type ClassValue, clsx } from "clsx";

/**
 * className 유틸리티 함수
 * clsx를 사용하여 조건부 className을 쉽게 처리
 *
 * @example
 * cn("text-red-500", isActive && "bg-blue-500")
 * cn({ "text-red-500": isError, "text-green-500": isSuccess })
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
