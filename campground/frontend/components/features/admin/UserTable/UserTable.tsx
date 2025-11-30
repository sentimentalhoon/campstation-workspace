/**
 * UserTable 컴포넌트
 * 사용자 목록을 테이블 형식으로 표시하고 관리
 */

"use client";

import {
  CheckCircle2,
  MoreVertical,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { User } from "../../../../types";

interface UserTableProps {
  users: User[];
  onUpdateRole: (
    userId: number,
    role: "MEMBER" | "OWNER" | "ADMIN"
  ) => Promise<void>;
  onUpdateStatus: (
    userId: number,
    status: "ACTIVE" | "INACTIVE"
  ) => Promise<void>;
  onDeleteUser: (userId: number) => Promise<void>;
}

export function UserTable({
  users,
  onUpdateRole,
  onUpdateStatus,
  onDeleteUser,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * 역할 변경 처리
   */
  const handleRoleChange = async (
    userId: number,
    role: "MEMBER" | "OWNER" | "ADMIN"
  ) => {
    if (
      !confirm(`사용자 역할을 ${getRoleLabel(role)}(으)로 변경하시겠습니까?`)
    ) {
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateRole(userId, role);
      setSelectedUser(null);
    } catch (error) {
      alert("역할 변경에 실패했습니다.");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * 상태 변경 처리
   */
  const handleStatusChange = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "활성화" : "비활성화";

    if (!confirm(`사용자를 ${action}하시겠습니까?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateStatus(userId, newStatus);
      setSelectedUser(null);
    } catch (error) {
      alert(`상태 변경에 실패했습니다.`);
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * 사용자 삭제 처리
   */
  const handleDeleteUser = async (userId: number, userName: string) => {
    if (
      !confirm(
        `${userName} 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setIsUpdating(true);
    try {
      await onDeleteUser(userId);
      setSelectedUser(null);
    } catch (error) {
      alert("사용자 삭제에 실패했습니다.");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <Shield className="mx-auto mb-2 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">사용자가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                사용자
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                역할
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                가입일
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                {/* 사용자 정보 */}
                <td className="px-4 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.phone && (
                      <div className="mt-0.5 text-xs text-gray-400">
                        {user.phone}
                      </div>
                    )}
                  </div>
                </td>

                {/* 역할 */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <span
                      className={`text-sm font-medium ${getRoleColor(user.role)}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </td>

                {/* 상태 */}
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status === "ACTIVE" ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        활성
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        비활성
                      </>
                    )}
                  </span>
                </td>

                {/* 가입일 */}
                <td className="px-4 py-4 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                </td>

                {/* 관리 메뉴 */}
                <td className="px-4 py-4">
                  <div className="flex justify-end">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setSelectedUser(
                            selectedUser === user.id ? null : user.id
                          )
                        }
                        className="rounded p-1 hover:bg-gray-100"
                        disabled={isUpdating}
                      >
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>

                      {selectedUser === user.id && (
                        <>
                          {/* 배경 클릭으로 닫기 */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setSelectedUser(null)}
                          />

                          {/* 드롭다운 메뉴 */}
                          <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border bg-white shadow-lg">
                            {/* 역할 변경 */}
                            <div className="border-b p-2">
                              <p className="mb-2 px-2 text-xs text-gray-500">
                                역할 변경
                              </p>
                              {(["MEMBER", "OWNER", "ADMIN"] as const).map(
                                (role) => (
                                  <button
                                    key={role}
                                    onClick={() =>
                                      handleRoleChange(user.id, role)
                                    }
                                    disabled={user.role === role || isUpdating}
                                    className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-gray-50 ${
                                      user.role === role
                                        ? "cursor-not-allowed text-gray-400"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {getRoleIcon(role)}
                                    {getRoleLabel(role)}
                                    {user.role === role && (
                                      <span className="ml-auto text-xs">
                                        (현재)
                                      </span>
                                    )}
                                  </button>
                                )
                              )}
                            </div>

                            {/* 상태 변경 */}
                            <div className="border-b p-2">
                              <button
                                onClick={() =>
                                  handleStatusChange(user.id, user.status)
                                }
                                disabled={isUpdating}
                                className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {user.status === "ACTIVE" ? (
                                  <>
                                    <XCircle className="h-4 w-4" />
                                    비활성화
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    활성화
                                  </>
                                )}
                              </button>
                            </div>

                            {/* 삭제 */}
                            <div className="p-2">
                              <button
                                onClick={() =>
                                  handleDeleteUser(user.id, user.name)
                                }
                                disabled={isUpdating}
                                className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                사용자 삭제
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 역할 아이콘 반환
 */
function getRoleIcon(role: string) {
  switch (role) {
    case "ADMIN":
      return <ShieldAlert className="h-4 w-4 text-red-600" />;
    case "OWNER":
      return <ShieldCheck className="h-4 w-4 text-blue-600" />;
    case "MEMBER":
    default:
      return <Shield className="h-4 w-4 text-gray-600" />;
  }
}

/**
 * 역할 색상 반환
 */
function getRoleColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return "text-red-600";
    case "OWNER":
      return "text-blue-600";
    case "MEMBER":
    default:
      return "text-gray-600";
  }
}

/**
 * 역할 레이블 반환
 */
function getRoleLabel(role: string): string {
  switch (role) {
    case "ADMIN":
      return "관리자";
    case "OWNER":
      return "사장님";
    case "MEMBER":
    default:
      return "일반 회원";
  }
}
