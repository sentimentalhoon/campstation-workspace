<script setup>
import BottomNav from "../common/BottomNav.vue";
import Header from "./Header.vue";
</script>

<template>
  <div class="min-h-screen bg-black flex justify-center">
    <div
      class="w-full max-w-[640px] bg-named-black min-h-screen shadow-xl relative pb-16 border-x border-dark-border"
    >
      <Header />
      <main>
        <slot />
      </main>
      <BottomNav />
    </div>
  </div>
</template>
