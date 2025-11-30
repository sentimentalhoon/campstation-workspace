<script setup>
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Filter,
  MapPin,
  Search,
  Shield,
  TrendingUp,
  UserX,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Filter states
const searchQuery = ref("");
const selectedRegion = ref("전체");
const selectedSort = ref("latest");
const showFilters = ref(false);

const regions = [
  "전체",
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회순" },
  { value: "danger", label: "위험도순" },
];

// Mock blacklist data
const blacklistData = ref([
  {
    id: 1,
    name: "김**",
    age: 23,
    gender: "남성",
    phone: "010-****-1234",
    region: "서울",
    pcCafe: "게임존 PC방",
    dangerLevel: "위험",
    reason: "기물 파손",
    description:
      "키보드와 마우스를 집어던지고 모니터를 주먹으로 때려 파손시킴. 손해배상 거부하고 도주함.",
    date: "2025-11-28",
    views: 1234,
    verified: true,
    imageCount: 3,
  },
  {
    id: 2,
    name: "박**",
    age: 31,
    gender: "남성",
    phone: "010-****-5678",
    region: "경기",
    pcCafe: "스타 PC방",
    dangerLevel: "경고",
    reason: "음식물 쓰레기 방치",
    description:
      "배달음식을 시켜먹고 쓰레기를 자리에 그대로 방치. 여러 번 주의를 줬으나 반복적으로 같은 행동 반복.",
    date: "2025-11-27",
    views: 856,
    verified: true,
    imageCount: 2,
  },
  {
    id: 3,
    name: "이**",
    age: 19,
    gender: "남성",
    phone: "010-****-9012",
    region: "부산",
    pcCafe: "메가 PC방",
    dangerLevel: "주의",
    reason: "흡연 및 욕설",
    description:
      "금연 구역에서 전자담배 흡연. 제지하자 욕설과 협박. 다른 고객들에게도 불쾌감을 줌.",
    date: "2025-11-26",
    views: 623,
    verified: false,
    imageCount: 1,
  },
  {
    id: 4,
    name: "최**",
    age: 27,
    gender: "남성",
    phone: "010-****-3456",
    region: "서울",
    pcCafe: "프리미엄 PC방",
    dangerLevel: "위험",
    reason: "음란물 시청",
    description:
      "성인 PC방임에도 불구하고 음란물을 큰 소리로 시청. 다른 손님들의 항의에도 불구하고 계속 시청. 경찰 신고 후 퇴장.",
    date: "2025-11-25",
    views: 2103,
    verified: true,
    imageCount: 0,
  },
  {
    id: 5,
    name: "정**",
    age: 35,
    gender: "남성",
    phone: "010-****-7890",
    region: "인천",
    pcCafe: "드림 PC방",
    dangerLevel: "경고",
    reason: "요금 미납",
    description:
      "12시간 사용 후 요금 결제 거부. CCTV 확인 결과 상습 먹튀범으로 확인됨. 경찰 신고 예정.",
    date: "2025-11-24",
    views: 945,
    verified: true,
    imageCount: 1,
  },
]);

// Computed filtered data
const filteredBlacklist = computed(() => {
  let result = [...blacklistData.value];

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (item) =>
        item.reason.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.pcCafe.toLowerCase().includes(query)
    );
  }

  // Region filter
  if (selectedRegion.value !== "전체") {
    result = result.filter((item) => item.region === selectedRegion.value);
  }

  // Sorting
  if (selectedSort.value === "views") {
    result.sort((a, b) => b.views - a.views);
  } else if (selectedSort.value === "danger") {
    const dangerWeight = { 위험: 3, 경고: 2, 주의: 1 };
    result.sort(
      (a, b) => dangerWeight[b.dangerLevel] - dangerWeight[a.dangerLevel]
    );
  } else {
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return result;
});

// Stats
const stats = computed(() => ({
  total: blacklistData.value.length,
  danger: blacklistData.value.filter((i) => i.dangerLevel === "위험").length,
  warning: blacklistData.value.filter((i) => i.dangerLevel === "경고").length,
  caution: blacklistData.value.filter((i) => i.dangerLevel === "주의").length,
}));

const getDangerColor = (level) => {
  switch (level) {
    case "위험":
      return "bg-red-500/10 text-red-500 border-red-500/30";
    case "경고":
      return "bg-orange-500/10 text-orange-500 border-orange-500/30";
    case "주의":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/30";
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  if (diff < 7) return `${diff}일 전`;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
};

const formatViews = (views) => {
  if (views >= 10000) return `${(views / 10000).toFixed(1)}만`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}천`;
  return views.toString();
};

const navigateToDetail = (id) => {
  router.push(`/detail/${id}`);
};

const navigateToRegister = () => {
  router.push("/register");
};
</script>

<template>
  <div class="min-h-screen bg-black pb-20">
    <!-- Hero Section -->
    <div
      class="bg-gradient-to-br from-red-900/20 to-orange-900/20 p-6 border-b border-red-900/30"
    >
      <div class="flex items-center space-x-3 mb-4">
        <div class="p-3 bg-red-500/20 rounded-xl">
          <Shield :size="32" class="text-red-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white">PC방 블랙리스트</h1>
          <p class="text-sm text-gray-400">악성 사용자 정보 공유 플랫폼</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-4 gap-2 mt-4">
        <div
          class="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-gray-800"
        >
          <div class="text-xs text-gray-400 mb-1">전체</div>
          <div class="text-xl font-bold text-white">{{ stats.total }}</div>
        </div>
        <div
          class="bg-red-500/10 backdrop-blur-sm rounded-lg p-3 border border-red-500/30"
        >
          <div class="text-xs text-red-400 mb-1">위험</div>
          <div class="text-xl font-bold text-red-500">{{ stats.danger }}</div>
        </div>
        <div
          class="bg-orange-500/10 backdrop-blur-sm rounded-lg p-3 border border-orange-500/30"
        >
          <div class="text-xs text-orange-400 mb-1">경고</div>
          <div class="text-xl font-bold text-orange-500">
            {{ stats.warning }}
          </div>
        </div>
        <div
          class="bg-yellow-500/10 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/30"
        >
          <div class="text-xs text-yellow-400 mb-1">주의</div>
          <div class="text-xl font-bold text-yellow-500">
            {{ stats.caution }}
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Section -->
    <div class="sticky top-0 z-40 bg-black border-b border-gray-800 p-4">
      <!-- Search Bar -->
      <div class="relative mb-3">
        <Search
          :size="20"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="사유, PC방 이름으로 검색..."
          class="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
        />
      </div>

      <!-- Filter Buttons -->
      <div class="flex space-x-2">
        <button
          @click="showFilters = !showFilters"
          class="flex items-center space-x-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white hover:border-red-500/50 transition-colors"
          :class="{ 'border-red-500/50 bg-red-500/10': showFilters }"
        >
          <Filter :size="16" />
          <span>필터</span>
          <ChevronDown
            :size="16"
            class="transition-transform"
            :class="{ 'rotate-180': showFilters }"
          />
        </button>

        <select
          v-model="selectedSort"
          class="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
        >
          <option
            v-for="opt in sortOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Region Filter (Expandable) -->
      <div
        v-if="showFilters"
        class="mt-3 p-3 bg-gray-900 border border-gray-800 rounded-lg"
      >
        <div class="text-xs text-gray-400 mb-2">지역 선택</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="region in regions"
            :key="region"
            @click="selectedRegion = region"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="
              selectedRegion === region
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            "
          >
            {{ region }}
          </button>
        </div>
      </div>
    </div>

    <!-- Blacklist Feed -->
    <div class="p-4 space-y-3">
      <div
        v-for="item in filteredBlacklist"
        :key="item.id"
        @click="navigateToDetail(item.id)"
        class="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-red-500/30 transition-all cursor-pointer"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-start space-x-3 flex-1">
            <div class="p-2 bg-red-500/10 rounded-lg">
              <UserX :size="20" class="text-red-500" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <h3 class="text-white font-bold">{{ item.name }}</h3>
                <span class="text-xs text-gray-500"
                  >{{ item.age }}세 · {{ item.gender }}</span
                >
                <span
                  v-if="item.verified"
                  class="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full"
                >
                  인증됨
                </span>
              </div>
              <div class="flex items-center space-x-2 text-xs text-gray-400">
                <MapPin :size="12" />
                <span>{{ item.region }} · {{ item.pcCafe }}</span>
              </div>
            </div>
          </div>

          <div
            class="px-3 py-1.5 rounded-lg text-xs font-bold border"
            :class="getDangerColor(item.dangerLevel)"
          >
            {{ item.dangerLevel }}
          </div>
        </div>

        <!-- Reason -->
        <div class="mb-3">
          <div
            class="inline-block px-3 py-1.5 bg-gray-800 rounded-lg text-sm font-medium text-white mb-2"
          >
            {{ item.reason }}
          </div>
          <p class="text-sm text-gray-300 leading-relaxed line-clamp-2">
            {{ item.description }}
          </p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-1">
              <Calendar :size="12" />
              <span>{{ formatDate(item.date) }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <TrendingUp :size="12" />
              <span>{{ formatViews(item.views) }}</span>
            </div>
            <span v-if="item.imageCount > 0" class="text-blue-400">
              📷 {{ item.imageCount }}
            </span>
          </div>
          <div class="text-gray-600">{{ item.phone }}</div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredBlacklist.length === 0"
        class="text-center py-16 text-gray-500"
      >
        <AlertTriangle :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="text-lg font-medium mb-2">검색 결과가 없습니다</p>
        <p class="text-sm">다른 검색어나 필터를 사용해보세요</p>
      </div>
    </div>

    <!-- Floating Action Button (Hidden - replaced by bottom nav) -->
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
