<script setup>
import { Activity, Home, MessageSquare, Trophy, User } from "lucide-vue-next";
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
        to="/livescore"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/livescore') ? 'text-white' : 'text-gray-500'"
      >
        <Activity :size="20" :stroke-width="isActive('/livescore') ? 2.5 : 2" />
        <span class="text-[10px] font-medium">스코어</span>
      </RouterLink>

      <RouterLink
        to="/betting"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/betting') ? 'text-white' : 'text-gray-500'"
      >
        <Trophy :size="20" :stroke-width="isActive('/betting') ? 2.5 : 2" />
        <span class="text-[10px] font-medium">승부예측</span>
      </RouterLink>

      <RouterLink
        to="/community"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/community') ? 'text-white' : 'text-gray-500'"
      >
        <MessageSquare
          :size="20"
          :stroke-width="isActive('/community') ? 2.5 : 2"
        />
        <span class="text-[10px] font-medium">커뮤니티</span>
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
