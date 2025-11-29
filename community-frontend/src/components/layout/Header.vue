<script setup>
import { Search, Bell } from "lucide-vue-next";
</script>

<template>
  <header class="sticky top-0 z-50 bg-named-black border-b border-dark-border">
    <div
      class="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between"
    >
      <h1 class="text-xl font-bold tracking-tight text-white">CampStation</h1>

      <div class="flex items-center space-x-4">
        <button class="text-gray-400 hover:text-white">
          <Search :size="24" />
        </button>
        <button class="text-gray-400 hover:text-white relative">
          <Bell :size="24" />
          <span
            class="absolute top-0 right-0 w-2 h-2 bg-named-highlight rounded-full border border-named-black"
          ></span>
        </button>
      </div>
    </div>
  </header>
</template>
