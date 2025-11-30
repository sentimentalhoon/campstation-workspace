/**
 * Excel 유틸리티 함수
 * ExcelJS 라이브러리를 사용한 엑셀 다운로드 기능
 */

import ExcelJS from "exceljs";

/**
 * 데이터를 엑셀 파일로 다운로드
 *
 * @param data - 엑셀로 변환할 데이터 배열
 * @param filename - 다운로드할 파일명 (확장자 제외)
 * @param sheetName - 시트 이름 (기본값: "Sheet1")
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function downloadExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = "Sheet1"
): Promise<void> {
  // 데이터가 없으면 경고
  if (!data || data.length === 0) {
    console.warn("다운로드할 데이터가 없습니다.");
    return;
  }

  // 워크북 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // 컬럼 헤더 추출
  if (data.length > 0 && data[0]) {
    const headers = Object.keys(data[0]);
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: 15,
    }));

    // 데이터 추가
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    // 헤더 스타일 적용
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
  }

  // 파일 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 여러 시트를 가진 엑셀 파일 다운로드
 */
export async function downloadMultiSheetExcel(
  sheets: Record<string, Array<Record<string, unknown>>>,
  filename: string
): Promise<void> {
  // 워크북 생성
  const workbook = new ExcelJS.Workbook();

  // 각 시트 추가
  Object.entries(sheets).forEach(([sheetName, data]) => {
    if (data && data.length > 0 && data[0]) {
      const worksheet = workbook.addWorksheet(sheetName);
      const headers = Object.keys(data[0]);

      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: 15,
      }));

      // 데이터 추가
      data.forEach((row) => {
        worksheet.addRow(row);
      });

      // 헤더 스타일 적용
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    }
  });

  // 파일 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 날짜를 엑셀 형식으로 포맷팅
 */
export function formatDateForExcel(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const parts = d.toISOString().split("T");
  return parts[0] || "";
}

/**
 * 금액을 엑셀 형식으로 포맷팅
 *
 * @param amount - 금액 (숫자)
 * @returns 천 단위 구분자가 있는 문자열
 */
export function formatCurrencyForExcel(amount: number): string {
  return amount.toLocaleString("ko-KR");
}
