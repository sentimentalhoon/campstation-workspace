/**
 * useReports Hook
 * 신고 목록 조회 및 처리
 */

import {
  adminApi,
  type ProcessReportRequest,
  type Report,
  type ReportStatus,
  type ReportType,
} from "@/lib/api/admin";
import type { PageResponse } from "@/types";
import { useCallback, useEffect, useState } from "react";

type UseReportsParams = {
  page?: number;
  size?: number;
  type?: ReportType;
  status?: ReportStatus;
};

export const useReports = (params?: UseReportsParams) => {
  const [reports, setReports] = useState<PageResponse<Report> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getAllReports(params);
      setReports(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /**
   * 신고 처리
   */
  const processReport = useCallback(
    async (reportId: number, data: ProcessReportRequest) => {
      try {
        await adminApi.processReport(reportId, data);
        await fetchReports(); // 목록 새로고침
      } catch (err) {
        console.error("Failed to process report:", err);
        throw err;
      }
    },
    [fetchReports]
  );

  return {
    reports,
    isLoading,
    error,
    refetch: fetchReports,
    processReport,
  };
};
