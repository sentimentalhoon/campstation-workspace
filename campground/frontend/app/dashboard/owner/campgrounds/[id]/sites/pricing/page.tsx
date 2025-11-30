/**
 * 요금제 관리 페이지
 * 사이트별 요금제 목록 조회 및 관리
 */

"use client";

import {
  OwnerDashboardNav,
  OwnerCampgroundDetailNav,
} from "@/components/features/dashboard";
import { withOwnerAuth } from "@/components/hoc";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Toast, type ToastVariant } from "@/components/ui/Toast";
import { useSitePricing } from "@/hooks/owner/useSitePricing";
import { ownerApi } from "@/lib/api/owner";
import type {
  CreateSitePricingRequest,
  SitePricingResponse,
} from "@/types/pricing";
import { Plus } from "lucide-react";
import { use, useEffect, useState } from "react";
import { PriceCalculator } from "./components/PriceCalculator";
import { PricingCard } from "./components/PricingCard";
import { PricingForm } from "./components/PricingForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function PricingManagementPage({ params }: PageProps) {
  const { id } = use(params);
  const campgroundId = Number(id);

  const [siteName, setSiteName] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [sites, setSites] = useState<Array<{ id: number; siteNumber: string }>>(
    []
  );

  // 탭 상태 (요금제 목록 / 요금 계산기)
  const [activeTab, setActiveTab] = useState<"list" | "calculator">("list");

  // 폼 모달 상태
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<
    SitePricingResponse | undefined
  >();

  // Toast 상태
  const [toast, setToast] = useState<{
    message: string;
    type: ToastVariant;
  } | null>(null);

  const showToast = (message: string, type: ToastVariant = "success") => {
    setToast({ message, type });
  };

  // 초기 사이트 목록 로드
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesRes = await ownerApi.getSites(campgroundId, {
          page: 0,
          size: 100,
        });
        const siteList = sitesRes.content || [];
        setSites(siteList);

        // 첫 번째 사이트를 기본 선택
        if (siteList.length > 0 && siteList[0]) {
          setSelectedSiteId(siteList[0].id);
          setSiteName(siteList[0].siteNumber);
        }
      } catch (error) {
        console.error("사이트 목록 로드 실패:", error);
      }
    };

    if (campgroundId) {
      fetchSites();
    }
  }, [campgroundId]);

  // 선택된 사이트의 요금제 조회
  const {
    pricings,
    isLoading,
    error,
    createPricing,
    updatePricing,
    deletePricing,
    toggleActive,
    refetch,
  } = useSitePricing({
    siteId: selectedSiteId || 0,
    autoFetch: !!selectedSiteId,
  });

  const handleSiteSelect = (siteId: number) => {
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      setSelectedSiteId(siteId);
      setSiteName(site.siteNumber);
    }
  };

  const handleCreatePricing = () => {
    setEditingPricing(undefined);
    setIsFormOpen(true);
  };

  const handleEditPricing = (pricing: SitePricingResponse) => {
    setEditingPricing(pricing);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPricing(undefined);
  };

  const handleSavePricing = async (data: CreateSitePricingRequest) => {
    if (!selectedSiteId) return;

    try {
      if (editingPricing) {
        // 수정
        await updatePricing(editingPricing.id, data);
        showToast("요금제가 수정되었습니다.", "success");
      } else {
        // 생성
        await createPricing(data);
        showToast("요금제가 생성되었습니다.", "success");
      }
      handleCloseForm();
    } catch (error) {
      console.error("요금제 저장 실패:", error);
      showToast("요금제 저장에 실패했습니다.", "error");
    }
  };

  const handleDeletePricing = async (
    pricingId: number,
    pricingName: string
  ) => {
    if (!window.confirm(`"${pricingName}" 요금제를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deletePricing(pricingId);
      showToast("요금제가 삭제되었습니다.", "success");
    } catch (error) {
      console.error("삭제 실패:", error);
      showToast("요금제 삭제에 실패했습니다.", "error");
    }
  };

  const handleToggleActive = async (pricing: SitePricingResponse) => {
    try {
      await toggleActive(pricing);
      const newStatus = pricing.isActive ? "비활성화" : "활성화";
      showToast(`요금제가 ${newStatus}되었습니다.`, "success");
    } catch (error) {
      console.error("상태 변경 실패:", error);
      showToast("요금제 상태 변경에 실패했습니다.", "error");
    }
  };

  // 로딩 상태
  if (sites.length === 0 && !selectedSiteId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
          <p className="text-gray-600">사이트 정보 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Navigation */}
      <OwnerDashboardNav />

      {/* Campground Detail Navigation */}
      <OwnerCampgroundDetailNav campgroundId={campgroundId} />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">요금제 관리</h1>
          <p className="mt-2 text-gray-600">
            사이트별 요금제를 설정하고 관리하세요.
          </p>
        </div>

        {/* 사이트 선택 */}
        {sites.length > 1 && (
          <div className="mb-6">
            <Select
              label="사이트 선택"
              value={selectedSiteId?.toString() || ""}
              onChange={(e) => handleSiteSelect(Number(e.target.value))}
              options={sites.map((site) => ({
                value: site.id.toString(),
                label: site.siteNumber,
              }))}
              className="max-w-xs"
            />
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("list")}
                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === "list"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                요금제 목록
              </button>
              <button
                onClick={() => setActiveTab("calculator")}
                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === "calculator"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                요금 계산기
              </button>
            </nav>
          </div>
        </div>

        {/* 요금제 목록 탭 */}
        {activeTab === "list" && (
          <div className="rounded-lg bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {siteName} 요금제
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  총 {pricings.length}개
                </p>
              </div>
              <Button onClick={handleCreatePricing} disabled={!selectedSiteId}>
                <Plus className="mr-2 h-4 w-4" />새 요금제 추가
              </Button>
            </div>

            {/* 로딩 */}
            {isLoading && (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
                <p className="text-gray-600">요금제 불러오는 중...</p>
              </div>
            )}

            {/* 에러 */}
            {error && (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-12 w-12 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  요금제 로드 실패
                </h3>
                <p className="mb-4 text-gray-600">{error.message}</p>
                <Button onClick={refetch} variant="outline">
                  다시 시도
                </Button>
              </div>
            )}

            {/* 빈 상태 */}
            {!isLoading && !error && pricings.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <Plus className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  등록된 요금제가 없습니다
                </h3>
                <p className="mb-4 text-gray-600">
                  첫 번째 요금제를 추가하여 사이트 가격을 설정하세요.
                </p>
                <Button onClick={handleCreatePricing}>
                  <Plus className="mr-2 h-4 w-4" />
                  요금제 추가
                </Button>
              </div>
            )}

            {/* 요금제 카드 목록 */}
            {!isLoading && !error && pricings.length > 0 && (
              <div className="divide-y divide-gray-200">
                {pricings.map((pricing) => (
                  <PricingCard
                    key={pricing.id}
                    pricing={pricing}
                    onEdit={() => handleEditPricing(pricing)}
                    onDelete={() =>
                      handleDeletePricing(pricing.id, pricing.pricingName)
                    }
                    onToggleActive={() => handleToggleActive(pricing)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 요금 계산기 탭 */}
        {activeTab === "calculator" && selectedSiteId && (
          <PriceCalculator siteId={selectedSiteId} siteName={siteName} />
        )}

        {/* Bottom Navigation 여백 */}
        <div className="h-20" />
      </div>

      {/* 요금제 생성/수정 폼 모달 */}
      {isFormOpen && selectedSiteId && (
        <PricingForm
          mode={editingPricing ? "edit" : "create"}
          siteId={selectedSiteId}
          siteName={siteName || "구역"}
          initialData={editingPricing}
          onSave={handleSavePricing}
          onCancel={handleCloseForm}
        />
      )}

      {/* Toast 알림 */}
      {toast && (
        <Toast
          id="pricing-toast"
          message={toast.message}
          variant={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default withOwnerAuth(PricingManagementPage);
