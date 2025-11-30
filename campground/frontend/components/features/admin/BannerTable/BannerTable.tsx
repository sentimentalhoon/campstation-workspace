/**
 * BannerTable 컴포넌트
 * 배너 목록을 테이블 형식으로 표시하고 관리
 * Drag & Drop으로 순서 변경 가능
 */

"use client";

import {
  useDeleteBanner,
  useUpdateBannerOrder,
  useUpdateBannerStatus,
} from "@/hooks";
import { Banner } from "@/types";
import {
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  GripVertical,
  MousePointerClick,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface BannerTableProps {
  banners: Banner[];
}

export function BannerTable({ banners }: BannerTableProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { mutate: updateOrder } = useUpdateBannerOrder();
  const { mutate: updateStatus } = useUpdateBannerStatus();
  const { mutate: deleteBanner } = useDeleteBanner();

  /**
   * 배너 상태 토글
   */
  const handleStatusToggle = (banner: Banner) => {
    const newStatus = banner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = newStatus === "ACTIVE" ? "활성화" : "비활성화";

    if (!confirm(`배너를 ${action}하시겠습니까?`)) {
      return;
    }

    setIsUpdating(true);
    updateStatus(
      { bannerId: banner.id, status: newStatus },
      {
        onSuccess: () => {
          setIsUpdating(false);
        },
        onError: () => {
          alert("상태 변경에 실패했습니다.");
          setIsUpdating(false);
        },
      }
    );
  };

  /**
   * 배너 삭제
   */
  const handleDelete = (banner: Banner) => {
    if (
      !confirm(
        `"${banner.title}" 배너를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setIsUpdating(true);
    deleteBanner(banner.id, {
      onSuccess: () => {
        setIsUpdating(false);
      },
      onError: () => {
        alert("배너 삭제에 실패했습니다.");
        setIsUpdating(false);
      },
    });
  };

  /**
   * Drag & Drop 순서 변경
   */
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // 순서 변경된 배너 리스트 생성
    const reorderedBanners = [...banners];
    const [draggedBanner] = reorderedBanners.splice(draggedIndex, 1);

    if (!draggedBanner) {
      setDraggedIndex(null);
      return;
    }

    reorderedBanners.splice(dropIndex, 0, draggedBanner);

    // 순서 업데이트 요청 생성
    const orderUpdates = reorderedBanners.map((banner, index) => ({
      bannerId: banner.id,
      displayOrder: index + 1,
    }));

    setIsUpdating(true);
    updateOrder(orderUpdates, {
      onSuccess: () => {
        setIsUpdating(false);
        setDraggedIndex(null);
      },
      onError: () => {
        alert("순서 변경에 실패했습니다.");
        setIsUpdating(false);
        setDraggedIndex(null);
      },
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (banners.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <Image
          src="/images/empty-state.svg"
          alt="배너 없음"
          width={120}
          height={120}
          className="mx-auto mb-4 opacity-50"
        />
        <p className="text-gray-500">등록된 배너가 없습니다</p>
        <Link
          href="/dashboard/admin/banners/create"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          배너 추가하기
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                순서
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                배너
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                타입
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                통계
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                상태
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {banners.map((banner, index) => (
              <tr
                key={banner.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`transition-colors hover:bg-gray-50 ${
                  draggedIndex === index ? "opacity-50" : ""
                } ${isUpdating ? "pointer-events-none opacity-50" : ""}`}
              >
                {/* 순서 (Drag Handle) */}
                <td className="px-2 py-4 text-center">
                  <div className="flex cursor-move items-center justify-center">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <span className="ml-1 text-sm font-medium text-gray-600">
                      {banner.displayOrder}
                    </span>
                  </div>
                </td>

                {/* 배너 정보 (이미지 + 제목) */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border">
                      <Image
                        src={
                          banner.image.thumbnailUrl ||
                          "/images/placeholder-banner.jpg"
                        }
                        alt={banner.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-medium text-gray-900">
                        {banner.title}
                      </p>
                      {banner.description && (
                        <p className="mt-0.5 line-clamp-1 text-sm text-gray-600">
                          {banner.description}
                        </p>
                      )}
                      {banner.linkUrl && (
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 line-clamp-1 text-xs text-blue-600 hover:underline"
                        >
                          {banner.linkUrl}
                        </a>
                      )}
                    </div>
                  </div>
                </td>

                {/* 타입 */}
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      banner.type === "PROMOTION"
                        ? "bg-purple-100 text-purple-800"
                        : banner.type === "EVENT"
                          ? "bg-orange-100 text-orange-800"
                          : banner.type === "ANNOUNCEMENT"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getTypeLabel(banner.type)}
                  </span>
                </td>

                {/* 통계 */}
                <td className="px-4 py-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{banner.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MousePointerClick className="h-3.5 w-3.5" />
                      <span>{banner.clickCount.toLocaleString()}</span>
                    </div>
                    {banner.viewCount > 0 && (
                      <div className="text-gray-500">
                        CTR:{" "}
                        {((banner.clickCount / banner.viewCount) * 100).toFixed(
                          1
                        )}
                        %
                      </div>
                    )}
                  </div>
                </td>

                {/* 상태 */}
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => handleStatusToggle(banner)}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor:
                        banner.status === "ACTIVE"
                          ? "#dcfce7"
                          : banner.status === "SCHEDULED"
                            ? "#fef3c7"
                            : "#fee2e2",
                      color:
                        banner.status === "ACTIVE"
                          ? "#15803d"
                          : banner.status === "SCHEDULED"
                            ? "#b45309"
                            : "#991b1b",
                    }}
                  >
                    {banner.status === "ACTIVE" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : banner.status === "SCHEDULED" ? (
                      <Clock className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {getStatusLabel(banner.status)}
                  </button>
                </td>

                {/* 관리 */}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/admin/banners/${banner.id}/edit`}
                      className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(banner)}
                      disabled={isUpdating}
                      className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
 * 배너 타입 라벨
 */
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PROMOTION: "프로모션",
    EVENT: "이벤트",
    ANNOUNCEMENT: "공지",
    NOTICE: "안내",
  };
  return labels[type] || type;
}

/**
 * 배너 상태 라벨
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "활성",
    INACTIVE: "비활성",
    SCHEDULED: "예약됨",
  };
  return labels[status] || status;
}
