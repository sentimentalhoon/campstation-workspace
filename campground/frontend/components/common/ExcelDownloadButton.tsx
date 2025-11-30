/**
 * ExcelDownloadButton 컴포넌트
 *
 * 데이터를 엑셀 파일로 다운로드하는 버튼
 *
 * @example
 * ```tsx
 * <ExcelDownloadButton
 *   data={users}
 *   filename="사용자목록"
 *   sheetName="사용자"
 *   label="엑셀 다운로드"
 * />
 * ```
 */

"use client";

import { downloadExcel } from "@/lib/utils/excel";
import { Download } from "lucide-react";

type ExcelDownloadButtonProps<T> = {
  data: T[];
  filename: string;
  sheetName?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * ExcelDownloadButton 컴포넌트
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ExcelDownloadButton<T extends Record<string, any>>({
  data,
  filename,
  sheetName = "Sheet1",
  label = "엑셀 다운로드",
  className = "",
  disabled = false,
}: ExcelDownloadButtonProps<T>) {
  const handleDownload = async () => {
    if (!data || data.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    try {
      await downloadExcel(data, filename, sheetName);
    } catch (error) {
      console.error("Excel download failed:", error);
      alert("엑셀 다운로드에 실패했습니다.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 ${className}`}
    >
      <Download className="h-4 w-4" />
      {label}
    </button>
  );
}
