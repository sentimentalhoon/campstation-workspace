/**
 * 비회원 예약 조회 컴포넌트
 * 예약번호와 비밀번호를 입력하여 예약 내역 조회
 */

"use client";

import { Button, Input } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GuestReservationLookup() {
  const router = useRouter();
  const [reservationNumber, setReservationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reservationNumber.trim()) {
      setError("예약번호를 입력해주세요");
      return;
    }

    if (!password.trim()) {
      setError("비밀번호를 입력해주세요");
      return;
    }

    setIsLoading(true);

    try {
      // API 호출: 비회원 예약 조회
      const response = await fetch(
        `/api/reservations/guest?reservationNumber=${encodeURIComponent(reservationNumber)}&password=${encodeURIComponent(password)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("예약 정보를 찾을 수 없습니다");
        } else if (response.status === 401) {
          setError("비밀번호가 일치하지 않습니다");
        } else {
          setError("예약 조회 중 오류가 발생했습니다");
        }
        return;
      }

      const reservation = await response.json();

      // 예약 상세 페이지로 이동 (게스트 모드)
      router.push(
        `/reservations/guest/${reservation.id}?number=${reservationNumber}&password=${encodeURIComponent(password)}`
      );
    } catch (err) {
      console.error("비회원 예약 조회 실패:", err);
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold text-neutral-900">
          비회원 예약 조회
        </h2>
        <p className="text-sm text-neutral-600">
          예약 시 입력하신 예약번호와 비밀번호를 입력해주세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="reservationNumber"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            예약번호
          </label>
          <Input
            id="reservationNumber"
            type="text"
            placeholder="예: RES20240101-ABCD"
            value={reservationNumber}
            onChange={(e) => setReservationNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            비밀번호
          </label>
          <Input
            id="password"
            type="password"
            placeholder="예약 시 설정한 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "조회 중..." : "예약 조회"}
        </Button>
      </form>

      <div className="mt-6 border-t border-neutral-200 pt-6">
        <p className="text-center text-xs text-neutral-500">
          예약번호는 예약 완료 시 발송된 이메일에서 확인하실 수 있습니다
        </p>
      </div>
    </div>
  );
}
