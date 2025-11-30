"use client";

import { ExcelDownloadButton } from "@/components/common/ExcelDownloadButton";
import { UserTable } from "@/components/features/admin/UserTable";
import { AdminDashboardNav } from "@/components/features/dashboard";
import { withAdminAuth } from "@/components/hoc";
import { Select } from "@/components/ui/Select";
import { useAllUsers } from "@/hooks";
import { Filter, Search, Users } from "lucide-react";
import { useState } from "react";

/**
 * 사용자 관리 페이지
 * 전체 사용자 목록 조회 및 역할/상태 관리
 */
function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "ALL" | "MEMBER" | "OWNER" | "ADMIN"
  >("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const { users, isLoading, error, updateRole, updateStatus, deleteUser } =
    useAllUsers({
      search: searchQuery || undefined,
      role: roleFilter !== "ALL" ? roleFilter : undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">사용자 목록 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center text-red-600">
          <p>사용자 목록을 불러오는데 실패했습니다.</p>
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

  const userList = users?.content || [];
  const totalUsers = users?.totalElements || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white">
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">사용자 관리</h1>
              <p className="mt-1 text-sm text-gray-600">
                전체 {totalUsers.toLocaleString()}명
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExcelDownloadButton
                data={userList}
                filename="사용자목록"
                sheetName="사용자"
                disabled={userList.length === 0}
              />
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="이름, 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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

          <div className="grid grid-cols-2 gap-3">
            {/* 역할 필터 */}
            <Select
              label="역할"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(
                  e.target.value as "ALL" | "MEMBER" | "OWNER" | "ADMIN"
                )
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "MEMBER", label: "일반 회원" },
                { value: "OWNER", label: "사장님" },
                { value: "ADMIN", label: "관리자" },
              ]}
            />

            {/* 상태 필터 */}
            <Select
              label="상태"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")
              }
              options={[
                { value: "ALL", label: "전체" },
                { value: "ACTIVE", label: "활성" },
                { value: "INACTIVE", label: "비활성" },
              ]}
            />
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-600">일반 회원</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {userList.filter((u) => u.role === "MEMBER").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-600">사장님</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {userList.filter((u) => u.role === "OWNER").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-600">관리자</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {userList.filter((u) => u.role === "ADMIN").length}
            </p>
          </div>
        </div>

        {/* 사용자 테이블 */}
        <UserTable
          users={userList}
          onUpdateRole={updateRole}
          onUpdateStatus={updateStatus}
          onDeleteUser={deleteUser}
        />

        {/* 페이지네이션 안내 */}
        {users && users.totalPages > 1 && (
          <div className="text-center text-sm text-gray-500">
            페이지 1 / {users.totalPages}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAdminAuth(AdminUsersPage);
