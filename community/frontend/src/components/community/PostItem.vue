<script setup>
import { MessageSquare, ThumbsUp, Eye } from "lucide-vue-next";

defineProps({
  post: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div
    class="flex items-start py-3 px-4 border-b border-dark-border hover:bg-dark-surface transition-colors cursor-pointer"
  >
    <div class="flex-1 min-w-0 mr-3">
      <div class="flex items-center space-x-2 mb-1">
        <span
          class="text-xs font-medium text-named-highlight bg-red-900/20 px-1.5 py-0.5 rounded"
          >{{ post.category }}</span
        >
        <span class="text-xs text-gray-400">{{ post.author }}</span>
        <span class="text-xs text-gray-600">• {{ post.timeAgo }}</span>
      </div>

      <h3
        class="text-sm font-medium text-gray-200 leading-snug mb-1 line-clamp-2"
      >
        {{ post.title }}
      </h3>

      <div class="flex items-center space-x-3 text-gray-500 mt-1.5">
        <div class="flex items-center space-x-1">
          <Eye :size="12" />
          <span class="text-xs">{{ post.views }}</span>
        </div>
        <div class="flex items-center space-x-1">
          <ThumbsUp :size="12" />
          <span class="text-xs">{{ post.likes }}</span>
        </div>
        <div class="flex items-center space-x-1">
          <MessageSquare :size="12" />
          <span class="text-xs">{{ post.comments }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="post.thumbnail"
      class="w-16 h-16 rounded overflow-hidden shrink-0 bg-dark-surface border border-dark-border"
    >
      <img
        :src="post.thumbnail"
        alt="thumbnail"
        class="w-full h-full object-cover"
      />
    </div>
  </div>
</template>
