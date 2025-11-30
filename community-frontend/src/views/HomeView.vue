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
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { fetchBlacklists, fetchStats } from "../services/api";
import { getFirstImage } from "../types/blacklist";

const router = useRouter();

// State
const searchQuery = ref("");
const selectedRegion = ref("전체");
const selectedSort = ref("latest");
const showFilters = ref(false);
const blacklistData = ref([]);
const stats = ref({
  total: 0,
  danger: 0,
  warning: 0,
  caution: 0,
});
const isLoading = ref(false);
const error = ref(null);

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

// Fetch data from API
async function loadBlacklists() {
  isLoading.value = true;
  error.value = null;

  try {
    const filters = {
      search: searchQuery.value || undefined,
      region:
        selectedRegion.value && selectedRegion.value !== "전체"
          ? selectedRegion.value
          : undefined,
      sortBy: selectedSort.value,
      page: 1,
      limit: 50,
    };

    const response = await fetchBlacklists(filters);
    blacklistData.value = response.items || [];
  } catch (err) {
    error.value = err.message || "데이터를 불러오는데 실패했습니다.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

async function loadStats() {
  try {
    const statsData = await fetchStats();
    stats.value = statsData;
  } catch (err) {
    console.error("Failed to load stats:", err);
  }
}

// Watch for filter changes
watch([searchQuery, selectedRegion, selectedSort], () => {
  loadBlacklists();
});

// Load data on mount
onMounted(() => {
  loadBlacklists();
  loadStats();
});

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
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-16">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-400">데이터를 불러오는 중...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-16 text-red-500">
        <AlertTriangle :size="48" class="mx-auto mb-4" />
        <p class="text-lg font-medium mb-2">오류가 발생했습니다</p>
        <p class="text-sm text-gray-400">{{ error }}</p>
        <button
          @click="loadBlacklists"
          class="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          다시 시도
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="blacklistData.length === 0"
        class="text-center py-16 text-gray-500"
      >
        <AlertTriangle :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="text-lg font-medium mb-2">검색 결과가 없습니다</p>
        <p class="text-sm">다른 검색어나 필터를 사용해보세요</p>
      </div>

      <!-- Blacklist Items -->
      <div
        v-else
        v-for="item in blacklistData"
        :key="item.id"
        @click="navigateToDetail(item.id)"
        class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-500/30 transition-all cursor-pointer"
      >
        <!-- Thumbnail Image (if exists) -->
        <div
          v-if="getFirstImage(item.images)"
          class="w-full h-48 bg-gray-800 overflow-hidden"
        >
          <img
            :src="getFirstImage(item.images)"
            :alt="item.reason"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Content -->
        <div class="p-4">
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
              <span
                v-if="item.images && item.images.length > 0"
                class="text-blue-400"
              >
                📷 {{ item.images.length / 2 }}
              </span>
            </div>
            <div class="text-gray-600">{{ item.phone }}</div>
          </div>
        </div>
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
