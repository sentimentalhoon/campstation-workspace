<script setup>
import { Bell, Home, Search, User } from "lucide-vue-next";
import { useRoute } from "vue-router";

const route = useRoute();

const isActive = (path) => route.path === path;
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-named-black border-t border-dark-border pb-safe"
  >
    <div class="max-w-[640px] mx-auto flex justify-around items-center h-14">
      <RouterLink
        to="/"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/') ? 'text-white' : 'text-gray-500'"
      >
        <Home :size="20" :stroke-width="isActive('/') ? 2.5 : 2" />
        <span class="text-[10px] font-medium">홈</span>
      </RouterLink>

      <RouterLink
        to="/search"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/search') ? 'text-white' : 'text-gray-500'"
      >
        <Search :size="20" :stroke-width="isActive('/search') ? 2.5 : 2" />
        <span class="text-[10px] font-medium">검색</span>
      </RouterLink>

      <RouterLink
        to="/register"
        class="flex flex-col items-center justify-center w-16 h-16 -mt-8"
      >
        <div
          class="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
        >
          <span class="text-2xl font-bold text-white">+</span>
        </div>
      </RouterLink>

      <RouterLink
        to="/notifications"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/notifications') ? 'text-white' : 'text-gray-500'"
      >
        <Bell :size="20" :stroke-width="isActive('/notifications') ? 2.5 : 2" />
        <span class="text-[10px] font-medium">알림</span>
      </RouterLink>

      <RouterLink
        to="/profile"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/profile') ? 'text-white' : 'text-gray-500'"
      >
        <User :size="20" :stroke-width="isActive('/profile') ? 2.5 : 2" />
        <span class="text-[10px] font-medium">내 정보</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
