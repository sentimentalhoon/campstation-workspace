<script setup>
import { User, Settings, LogOut, ChevronRight } from "lucide-vue-next";
</script>

<template>
  <div class="bg-black min-h-full pb-20">
    <!-- Profile Header -->
    <div class="bg-named-black p-6 mb-2 border-b border-dark-border">
      <div class="flex items-center space-x-4">
        <div
          class="w-16 h-16 bg-dark-surface rounded-full flex items-center justify-center border border-dark-border"
        >
          <User :size="32" class="text-gray-400" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-white">게스트</h2>
          <p class="text-sm text-gray-500">로그인이 필요합니다</p>
        </div>
      </div>
      <button
        class="mt-4 w-full bg-white text-black py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
      >
        로그인 / 회원가입
      </button>
    </div>

    <!-- Menu List -->
    <div class="bg-named-black border-t border-dark-border">
      <div
        class="p-4 border-b border-dark-border flex items-center justify-between cursor-pointer hover:bg-dark-surface transition-colors"
      >
        <div class="flex items-center space-x-3">
          <Settings :size="20" class="text-gray-400" />
          <span class="text-sm font-medium text-gray-200">설정</span>
        </div>
        <ChevronRight :size="16" class="text-gray-600" />
      </div>

      <div
        class="p-4 border-b border-dark-border flex items-center justify-between cursor-pointer hover:bg-dark-surface transition-colors"
      >
        <div class="flex items-center space-x-3">
          <LogOut :size="20" class="text-gray-400" />
          <span class="text-sm font-medium text-gray-200">로그아웃</span>
        </div>
        <ChevronRight :size="16" class="text-gray-600" />
      </div>
    </div>
  </div>
</template>
