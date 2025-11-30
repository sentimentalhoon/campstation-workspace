"use client";

import { AdminDashboardNav } from "@/components/features/dashboard";
import { withAdminAuth } from "@/components/hoc";
import { EmptyState } from "@/components/ui";
import { Select } from "@/components/ui/Select";
import { useReports } from "@/hooks";
import { useToast } from "@/hooks/ui/useToast";
import { AlertTriangle, Check, Filter, X } from "lucide-react";
import { useState } from "react";

type ReportType = "REVIEW" | "CAMPGROUND" | "USER";
type ReportStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * 신고 관리 페이지
 * 전체 신고 목록 조회 및 처리
 */
function AdminReportsPage() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReportStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | ReportType>("ALL");

  const { reports, isLoading, error, processReport } = useReports({
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    type: typeFilter !== "ALL" ? typeFilter : undefined,
  });

  /**
   * 신고 승인 처리
   */
  const handleApprove = async (id: number) => {
    if (
      !confirm("신고를 승인하시겠습니까?\n대상 콘텐츠가 삭제될 수 있습니다.")
    ) {
      return;
    }

    try {
      await processReport(id, { status: "APPROVED" as const });
      toast.success("승인되었습니다");
    } catch (error) {
      toast.error("처리에 실패했습니다");
      console.error(error);
    }
  };

  /**
   * 신고 거부 처리
   */
  const handleReject = async (id: number) => {
    if (!confirm("신고를 거부하시겠습니까?")) {
      return;
    }

    try {
      await processReport(id, { status: "REJECTED" as const });
      toast.success("거부되었습니다");
    } catch (error) {
      toast.error("처리에 실패했습니다");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">신고 목록 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>신고 목록을 불러오는데 실패했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const reportList = reports?.content || [];
  const totalReports = reports?.totalElements || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">신고 관리</h1>
              <p className="mt-1 text-sm text-gray-600">
                전체 {totalReports.toLocaleString()}건
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <AdminDashboardNav />

      <div className="space-y-4 p-4">
        {/* 필터 */}
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold">필터</h2>
          </div>

          <div className="space-y-3">
            <Select
              label="신고 타입"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "ALL" | ReportType)
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "CAMPGROUND", label: "캠핑장" },
                { value: "REVIEW", label: "리뷰" },
                { value: "USER", label: "사용자" },
              ]}
            />

            <Select
              label="처리 상태"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | ReportStatus)
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "PENDING", label: "대기" },
                { value: "APPROVED", label: "승인" },
                { value: "REJECTED", label: "거부" },
              ]}
            />
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-gray-600">대기</p>
            <p className="mt-1 text-xl font-bold text-orange-600">
              {reportList.filter((r) => r.status === "PENDING").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-gray-600">승인</p>
            <p className="mt-1 text-xl font-bold text-green-600">
              {reportList.filter((r) => r.status === "APPROVED").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-3">
            <p className="text-xs text-gray-600">거부</p>
            <p className="mt-1 text-xl font-bold text-red-600">
              {reportList.filter((r) => r.status === "REJECTED").length}
            </p>
          </div>
        </div>

        {/* 신고 목록 */}
        <div className="space-y-3">
          {reportList.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="h-full w-full" />}
              title="신고 내역이 없습니다"
              variant="bordered"
            />
          ) : (
            reportList.map((report) => (
              <div
                key={report.id}
                className="overflow-hidden rounded-lg border bg-white"
              >
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeStyle(
                            report.type
                          )}`}
                        >
                          {getTypeLabel(report.type)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusStyle(
                            report.status
                          )}`}
                        >
                          {getStatusLabel(report.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        신고자: {report.reporterName}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 rounded-lg bg-gray-50 p-3">
                    <p className="mb-1 text-sm font-medium text-gray-900">
                      신고 내용
                    </p>
                    <p className="text-sm text-gray-700">{report.reason}</p>
                  </div>

                  <div className="text-xs text-gray-500">
                    신고일:{" "}
                    {new Date(report.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>

                {/* 관리 버튼 */}
                {report.status === "PENDING" && (
                  <div className="flex gap-2 border-t bg-gray-50 p-3">
                    <button
                      onClick={() => handleApprove(report.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                      승인
                    </button>
                    <button
                      onClick={() => handleReject(report.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                      거부
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 안내 */}
        {reports && reports.totalPages > 1 && (
          <div className="text-center text-sm text-gray-500">
            페이지 1 / {reports.totalPages}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 타입 스타일
 */
function getTypeStyle(type: ReportType): string {
  switch (type) {
    case "CAMPGROUND":
      return "bg-purple-100 text-purple-800";
    case "REVIEW":
      return "bg-blue-100 text-blue-800";
    case "USER":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * 타입 레이블
 */
function getTypeLabel(type: ReportType): string {
  switch (type) {
    case "CAMPGROUND":
      return "캠핑장";
    case "REVIEW":
      return "리뷰";
    case "USER":
      return "사용자";
    default:
      return type;
  }
}

/**
 * 상태 스타일
 */
function getStatusStyle(status: ReportStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-orange-100 text-orange-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * 상태 레이블
 */
function getStatusLabel(status: ReportStatus): string {
  switch (status) {
    case "PENDING":
      return "대기";
    case "APPROVED":
      return "승인";
    case "REJECTED":
      return "거부";
    default:
      return status;
  }
}

export default withAdminAuth(AdminReportsPage);
