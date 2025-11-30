<script setup>
import { Shield, Menu } from "lucide-vue-next";
</script>

<template>
  <header class="sticky top-0 z-50 bg-named-black border-b border-dark-border">
    <div
      class="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between"
    >
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-red-500/20 rounded-lg">
          <Shield :size="20" class="text-red-500" />
        </div>
        <h1 class="text-xl font-bold tracking-tight text-white">PC방 블랙리스트</h1>
      </div>

      <button class="text-gray-400 hover:text-white p-2">
        <Menu :size="24" />
      </button>
    </div>
  </header>
</template>
