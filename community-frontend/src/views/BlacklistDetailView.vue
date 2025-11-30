<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Eye,
  Share2,
  Flag,
  UserX,
  AlertTriangle,
  Phone,
  Building2,
  Clock,
  ImageIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const blacklistId = ref(route.params.id || 1);

// Mock data - 실제로는 API에서 가져옴
const blacklist = ref({
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
    "2025년 11월 28일 오후 3시경, 게임에서 졌다는 이유로 키보드와 마우스를 집어던지고 모니터를 주먹으로 여러 차례 때려 파손시켰습니다.\n\n파손된 장비:\n- 삼성 모니터 27인치 (약 35만원)\n- 로지텍 키보드 (약 15만원)\n- 로지텍 마우스 (약 8만원)\n\n손해배상 요구에 욕설과 협박을 하며 거부하였고, 경찰 신고 예고하자 도주하였습니다. CCTV에 모든 장면이 녹화되어 있으며 현재 경찰 수사 진행 중입니다.",
  detailedInfo: "게임 패배 후 분노 조절 장애 의심. 주변 손님들에게도 위협적인 언행을 보였음.",
  date: "2025-11-28",
  views: 1234,
  verified: true,
  images: [
    "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400",
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400",
    "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=400",
  ],
  reportedBy: "게임존 PC방 관리자",
  reportDate: "2025-11-28 15:30",
  status: "경찰 신고 완료",
});

const currentImageIndex = ref(0);
const showImageModal = ref(false);

const getDangerColor = (level) => {
  switch (level) {
    case "위험":
      return {
        bg: "bg-red-500/10",
        text: "text-red-500",
        border: "border-red-500/30",
        badge: "bg-red-500",
      };
    case "경고":
      return {
        bg: "bg-orange-500/10",
        text: "text-orange-500",
        border: "border-orange-500/30",
        badge: "bg-orange-500",
      };
    case "주의":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-500",
        border: "border-yellow-500/30",
        badge: "bg-yellow-500",
      };
    default:
      return {
        bg: "bg-gray-500/10",
        text: "text-gray-500",
        border: "border-gray-500/30",
        badge: "bg-gray-500",
      };
  }
};

const dangerColors = computed(() => getDangerColor(blacklist.value.dangerLevel));

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = days[date.getDay()];
  return `${year}.${month}.${day} (${dayOfWeek})`;
};

const formatViews = (views) => {
  if (views >= 10000) return `${(views / 10000).toFixed(1)}만`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}천`;
  return views.toString();
};

const openImageModal = (index) => {
  currentImageIndex.value = index;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
};

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % blacklist.value.images.length;
};

const prevImage = () => {
  currentImageIndex.value =
    (currentImageIndex.value - 1 + blacklist.value.images.length) %
    blacklist.value.images.length;
};

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: `블랙리스트 - ${blacklist.value.name}`,
      text: `${blacklist.value.reason} - ${blacklist.value.pcCafe}`,
      url: window.location.href,
    });
  } else {
    alert("공유 기능을 지원하지 않는 브라우저입니다");
  }
};

const handleReport = () => {
  if (confirm("이 게시물을 신고하시겠습니까?")) {
    alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
  }
};

onMounted(() => {
  // Increment view count
  blacklist.value.views++;
});
</script>

<template>
  <div class="min-h-screen bg-black pb-20">
    <!-- Header -->
    <div class="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
      <div class="flex items-center justify-between">
        <button @click="router.back()" class="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft :size="24" />
        </button>
        <h1 class="text-lg font-bold text-white">상세 정보</h1>
        <div class="flex items-center space-x-2">
          <button @click="handleShare" class="p-2 text-gray-400 hover:text-white">
            <Share2 :size="20" />
          </button>
          <button @click="handleReport" class="p-2 text-gray-400 hover:text-white">
            <Flag :size="20" />
          </button>
        </div>
      </div>
    </div>

    <!-- Danger Badge -->
    <div class="p-4">
      <div
        class="p-4 rounded-xl border-2 flex items-center justify-between"
        :class="[dangerColors.bg, dangerColors.border]"
      >
        <div class="flex items-center space-x-3">
          <div class="p-3 bg-black/30 rounded-xl">
            <AlertTriangle :size="24" :class="dangerColors.text" />
          </div>
          <div>
            <div class="text-xs text-gray-400 mb-1">위험도</div>
            <div class="text-2xl font-bold" :class="dangerColors.text">
              {{ blacklist.dangerLevel }}
            </div>
          </div>
        </div>
        <div
          v-if="blacklist.verified"
          class="flex items-center space-x-1 px-3 py-2 bg-blue-500/20 rounded-lg border border-blue-500/30"
        >
          <CheckCircle2 :size="16" class="text-blue-400" />
          <span class="text-sm font-medium text-blue-400">인증됨</span>
        </div>
      </div>
    </div>

    <!-- Basic Info -->
    <div class="px-4 pb-4">
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div class="flex items-start space-x-3 mb-4">
          <div class="p-3 bg-red-500/10 rounded-xl">
            <UserX :size="24" class="text-red-500" />
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-white mb-2">{{ blacklist.name }}</h2>
            <div class="flex items-center space-x-3 text-sm text-gray-400">
              <span>{{ blacklist.age }}세</span>
              <span>·</span>
              <span>{{ blacklist.gender }}</span>
            </div>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-gray-800 rounded-lg">
            <div class="flex items-center space-x-2 mb-2">
              <Phone :size="14" class="text-gray-500" />
              <span class="text-xs text-gray-500">연락처</span>
            </div>
            <div class="text-sm font-medium text-white">{{ blacklist.phone }}</div>
          </div>

          <div class="p-3 bg-gray-800 rounded-lg">
            <div class="flex items-center space-x-2 mb-2">
              <MapPin :size="14" class="text-gray-500" />
              <span class="text-xs text-gray-500">지역</span>
            </div>
            <div class="text-sm font-medium text-white">{{ blacklist.region }}</div>
          </div>

          <div class="col-span-2 p-3 bg-gray-800 rounded-lg">
            <div class="flex items-center space-x-2 mb-2">
              <Building2 :size="14" class="text-gray-500" />
              <span class="text-xs text-gray-500">PC방</span>
            </div>
            <div class="text-sm font-medium text-white">{{ blacklist.pcCafe }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Incident Info -->
    <div class="px-4 pb-4">
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div class="mb-4">
          <div class="text-xs text-gray-500 mb-2">사유</div>
          <div class="inline-block px-4 py-2 bg-red-500/20 rounded-lg border border-red-500/30">
            <span class="text-lg font-bold text-red-400">{{ blacklist.reason }}</span>
          </div>
        </div>

        <div class="mb-4">
          <div class="text-xs text-gray-500 mb-2">상세 내용</div>
          <div class="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {{ blacklist.description }}
          </div>
        </div>

        <div v-if="blacklist.detailedInfo" class="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
          <div class="flex items-start space-x-2">
            <AlertTriangle :size="16" class="text-orange-400 mt-0.5 flex-shrink-0" />
            <p class="text-sm text-orange-200">{{ blacklist.detailedInfo }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Evidence Images -->
    <div v-if="blacklist.images.length > 0" class="px-4 pb-4">
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <ImageIcon :size="18" class="text-gray-400" />
            <span class="text-sm font-bold text-white">증거 사진</span>
          </div>
          <span class="text-xs text-gray-500">{{ blacklist.images.length }}장</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="(image, index) in blacklist.images"
            :key="index"
            @click="openImageModal(index)"
            class="aspect-square rounded-lg overflow-hidden bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img :src="image" alt="증거 사진" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>

    <!-- Report Info -->
    <div class="px-4 pb-4">
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div class="text-xs text-gray-500 mb-3">신고 정보</div>

        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">신고자</span>
            <span class="text-white font-medium">{{ blacklist.reportedBy }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">신고일시</span>
            <span class="text-white font-medium">{{ blacklist.reportDate }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">처리 상태</span>
            <span class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
              {{ blacklist.status }}
            </span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">조회수</span>
            <div class="flex items-center space-x-1">
              <Eye :size="14" class="text-gray-500" />
              <span class="text-white font-medium">{{ formatViews(blacklist.views) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Meta Info -->
    <div class="px-4 pb-4">
      <div class="flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div class="flex items-center space-x-1">
          <Calendar :size="12" />
          <span>{{ formatDate(blacklist.date) }}</span>
        </div>
        <span>·</span>
        <div class="flex items-center space-x-1">
          <Clock :size="12" />
          <span>신고 ID: {{ blacklist.id }}</span>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <Teleport to="body">
      <div
        v-if="showImageModal"
        class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        @click="closeImageModal"
      >
        <button
          @click.stop="closeImageModal"
          class="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <span class="text-xl">×</span>
        </button>

        <button
          v-if="blacklist.images.length > 1"
          @click.stop="prevImage"
          class="absolute left-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ChevronLeft :size="24" />
        </button>

        <div class="max-w-screen-lg w-full px-4" @click.stop>
          <img
            :src="blacklist.images[currentImageIndex]"
            alt="증거 사진"
            class="w-full h-auto rounded-lg"
          />
          <div class="text-center mt-4 text-white">
            {{ currentImageIndex + 1 }} / {{ blacklist.images.length }}
          </div>
        </div>

        <button
          v-if="blacklist.images.length > 1"
          @click.stop="nextImage"
          class="absolute right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ChevronRight :size="24" />
        </button>
      </div>
    </Teleport>
  </div>
</template>
