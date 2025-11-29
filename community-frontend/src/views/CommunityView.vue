<script setup>
import { ref } from "vue";
import PostList from "../components/community/PostList.vue";

const categories = ["전체", "자유", "질문", "정보", "후기", "장비", "캠핑장"];
const activeCategory = ref("전체");

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
  // More dummy data...
]);
</script>

<template>
  <div>
    <div
      class="bg-named-black px-4 py-3 border-b border-dark-border overflow-x-auto whitespace-nowrap no-scrollbar sticky top-14 z-40"
    >
      <button
        v-for="category in categories"
        :key="category"
        @click="activeCategory = category"
        class="px-3 py-1.5 rounded-full text-sm font-medium mr-2 transition-colors"
        :class="
          activeCategory === category
            ? 'bg-white text-black'
            : 'bg-dark-surface text-gray-400 hover:bg-dark-border'
        "
      >
        {{ category }}
      </button>
    </div>

    <PostList :posts="posts" />
  </div>
</template>
