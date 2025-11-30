/**
 * 캠핑장 구역(사이트) 관리 페이지
 */

"use client";

import {
  OwnerCampgroundDetailNav,
  OwnerDashboardNav,
} from "@/components/features/dashboard";
import { SiteManager } from "@/components/features/owner/SiteManager";
import { withOwnerAuth } from "@/components/hoc";
import { Button } from "@/components/ui/Button";
import { ownerApi } from "@/lib/api/owner";
import { DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function CampgroundSitesPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const campgroundId = Number(id);

  const [activeTab, setActiveTab] = useState<"sites" | "pricing">("sites");
  const [isLoading, setIsLoading] = useState(true);
  const [campgroundName, setCampgroundName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const campgroundsRes = await ownerApi.getMyCampgrounds({
          page: 0,
          size: 100,
        });
        const campground = campgroundsRes.content?.find(
          (c) => c.id === campgroundId
        );
        if (campground) {
          setCampgroundName(campground.name);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [campgroundId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50">
      {/* Dashboard Navigation */}
      <OwnerDashboardNav />

      {/* Campground Detail Navigation */}
      <OwnerCampgroundDetailNav campgroundId={campgroundId} />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            구역 관리
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {campgroundName}의 구역(사이트)을 관리하세요.
          </p>
        </div>
        <div className="mb-4">
          <div className="rounded-2xl bg-white p-1 shadow-md">
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab("sites")}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === "sites"
                    ? "bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                구역 목록
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === "pricing"
                    ? "bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                요금제 관리
              </button>
            </nav>
          </div>
        </div>
        {activeTab === "sites" && <SiteManager campgroundId={campgroundId} />}
        {activeTab === "pricing" && (
          <div className="rounded-2xl bg-white p-8 shadow-md sm:p-12">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-100 to-emerald-100">
                <DollarSign className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                요금제 관리
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                사이트별로 요금제를 관리하려면 요금제 페이지로 이동하세요.
              </p>
              <Button
                onClick={() =>
                  router.push(
                    `/dashboard/owner/campgrounds/${campgroundId}/sites/pricing`
                  )
                }
                className="rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95"
              >
                요금제 관리 페이지로 이동
              </Button>
            </div>
          </div>
        )}
        <div className="h-20" />
      </div>
    </div>
  );
}

export default withOwnerAuth(CampgroundSitesPage);
