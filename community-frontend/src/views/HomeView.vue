<script setup>
import { ref } from "vue";
import PostList from "../components/community/PostList.vue";
import {
  Flame,
  Clock,
  TrendingUp,
  Tent,
  Map,
  ShoppingBag,
  Trophy,
  Calendar,
} from "lucide-vue-next";

const activeTab = ref("popular");

const tabs = [
  { id: "popular", label: "인기", icon: Flame },
  { id: "recent", label: "최신", icon: Clock },
  { id: "trending", label: "급상승", icon: TrendingUp },
];

const quickMenu = [
  { id: 1, label: "캠핑장", icon: Tent, color: "bg-blue-500" },
  { id: 2, label: "지도", icon: Map, color: "bg-green-500" },
  { id: 3, label: "장터", icon: ShoppingBag, color: "bg-orange-500" },
  { id: 4, label: "랭킹", icon: Trophy, color: "bg-yellow-500" },
  { id: 5, label: "일정", icon: Calendar, color: "bg-purple-500" },
];

// Dummy data
const posts = ref([
  {
    id: 1,
    category: "자유",
    title: "이번 주말 캠핑장 추천 부탁드립니다! 서울 근교로 찾고 있어요.",
    author: "캠린이",
    timeAgo: "10분 전",
    views: 120,
    likes: 45,
    comments: 12,
    thumbnail:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  },
  // ...existing code...
  {
    id: 2,
    category: "장비",
    title: "스노우피크 텐트 중고로 샀는데 상태 좀 봐주세요",
    author: "장비병",
    timeAgo: "30분 전",
    views: 85,
    likes: 12,
    comments: 8,
    thumbnail: null,
  },
  {
    id: 3,
    category: "후기",
    title: "가평 자라섬 캠핑장 다녀왔습니다. 날씨가 너무 좋았네요.",
    author: "여행가",
    timeAgo: "1시간 전",
    views: 340,
    likes: 120,
    comments: 34,
    thumbnail:
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 4,
    category: "질문",
    title: "동계 캠핑 난로 파세코 vs 도요토미 어떤게 좋을까요?",
    author: "추워요",
    timeAgo: "2시간 전",
    views: 210,
    likes: 23,
    comments: 45,
    thumbnail: null,
  },
  {
    id: 5,
    category: "자유",
    title: "캠핑 요리 레시피 공유합니다. 간단하게 만드는 밀키트 추천!",
    author: "요리왕",
    timeAgo: "3시간 전",
    views: 150,
    likes: 56,
    comments: 10,
    thumbnail:
      "https://images.unsplash.com/photo-1529312266912-b33cf6227e2f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  },
]);
</script>

<template>
  <div>
    <!-- Quick Menu Grid -->
    <div
      class="grid grid-cols-5 gap-2 p-4 bg-named-black border-b border-dark-border"
    >
      <button
        v-for="menu in quickMenu"
        :key="menu.id"
        class="flex flex-col items-center space-y-1.5"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
          :class="menu.color"
        >
          <component :is="menu.icon" :size="24" />
        </div>
        <span class="text-xs text-gray-400">{{ menu.label }}</span>
      </button>
    </div>

    <!-- Tabs -->
    <div
      class="flex border-b border-dark-border bg-named-black sticky top-14 z-40"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors relative"
        :class="activeTab === tab.id ? 'text-white' : 'text-gray-500'"
      >
        <component :is="tab.icon" :size="16" class="mr-1.5" />
        {{ tab.label }}
        <div
          v-if="activeTab === tab.id"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-named-highlight mx-4"
        ></div>
      </button>
    </div>

    <!-- Content -->
    <PostList :posts="posts" />
  </div>
</template>
