/**
 * useAllUsers Hook
 * 전체 사용자 목록 조회 및 관리
 */

import {
  adminApi,
  type UpdateUserRoleRequest,
  type UpdateUserStatusRequest,
} from "@/lib/api/admin";
import type { PageResponse, User } from "@/types";
import { useCallback, useEffect, useState } from "react";

type UseAllUsersParams = {
  page?: number;
  size?: number;
  role?: "MEMBER" | "OWNER" | "ADMIN";
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
};

export const useAllUsers = (params?: UseAllUsersParams) => {
  const [users, setUsers] = useState<PageResponse<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getAllUsers(params);
      setUsers(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * 사용자 역할 변경
   */
  const updateRole = useCallback(
    async (userId: number, role: UpdateUserRoleRequest["role"]) => {
      try {
        await adminApi.updateUserRole(userId, { role });
        await fetchUsers(); // 목록 새로고침
      } catch (err) {
        console.error("Failed to update user role:", err);
        throw err;
      }
    },
    [fetchUsers]
  );

  /**
   * 사용자 상태 변경
   */
  const updateStatus = useCallback(
    async (userId: number, status: UpdateUserStatusRequest["status"]) => {
      try {
        await adminApi.updateUserStatus(userId, { status });
        await fetchUsers(); // 목록 새로고침
      } catch (err) {
        console.error("Failed to update user status:", err);
        throw err;
      }
    },
    [fetchUsers]
  );

  /**
   * 사용자 삭제
   */
  const deleteUser = useCallback(
    async (userId: number) => {
      try {
        await adminApi.deleteUser(userId);
        await fetchUsers(); // 목록 새로고침
      } catch (err) {
        console.error("Failed to delete user:", err);
        throw err;
      }
    },
    [fetchUsers]
  );

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    updateRole,
    updateStatus,
    deleteUser,
  };
};
