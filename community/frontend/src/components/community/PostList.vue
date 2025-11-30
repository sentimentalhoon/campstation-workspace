<script setup>
import PostItem from "./PostItem.vue";

defineProps({
  posts: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="bg-named-black">
    <PostItem v-for="post in posts" :key="post.id" :post="post" />
  </div>
</template>
