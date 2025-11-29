<script setup>
import { Calendar, ChevronLeft, ChevronRight, Star } from "lucide-vue-next";
import { ref } from "vue";

const currentDate = ref("11.30 (토)");

const leagues = ref([
  {
    id: 1,
    name: "Premier League",
    country: "England",
    flag: "🇬🇧",
    matches: [
      {
        id: 101,
        time: "21:30",
        status: "LIVE",
        home: "Man City",
        away: "Liverpool",
        homeScore: 1,
        awayScore: 1,
        timeElapsed: "34'",
      },
      {
        id: 102,
        time: "23:00",
        status: "WAIT",
        home: "Arsenal",
        away: "Chelsea",
        homeScore: 0,
        awayScore: 0,
        timeElapsed: "",
      },
    ],
  },
  {
    id: 2,
    name: "La Liga",
    country: "Spain",
    flag: "🇪🇸",
    matches: [
      {
        id: 201,
        time: "02:00",
        status: "END",
        home: "Real Madrid",
        away: "Barcelona",
        homeScore: 2,
        awayScore: 1,
        timeElapsed: "FT",
      },
    ],
  },
  {
    id: 3,
    name: "Serie A",
    country: "Italy",
    flag: "🇮🇹",
    matches: [
      {
        id: 301,
        time: "04:45",
        status: "WAIT",
        home: "Juventus",
        away: "AC Milan",
        homeScore: 0,
        awayScore: 0,
        timeElapsed: "",
      },
      {
        id: 302,
        time: "04:45",
        status: "WAIT",
        home: "Napoli",
        away: "Inter",
        homeScore: 0,
        awayScore: 0,
        timeElapsed: "",
      },
    ],
  },
]);

const getStatusColor = (status) => {
  switch (status) {
    case "LIVE":
      return "text-named-highlight animate-pulse";
    case "END":
      return "text-gray-500";
    default:
      return "text-gray-400";
  }
};
</script>

<template>
  <div class="bg-black min-h-full pb-20">
    <!-- Date Selector -->
    <div
      class="bg-named-black border-b border-dark-border p-3 flex items-center justify-between sticky top-14 z-40"
    >
      <button class="p-1 text-gray-400 hover:text-white">
        <ChevronLeft :size="20" />
      </button>
      <div class="flex items-center space-x-2 text-white font-medium">
        <Calendar :size="16" />
        <span>{{ currentDate }}</span>
      </div>
      <button class="p-1 text-gray-400 hover:text-white">
        <ChevronRight :size="20" />
      </button>
    </div>

    <!-- Matches List -->
    <div class="space-y-2 mt-2">
      <div
        v-for="league in leagues"
        :key="league.id"
        class="bg-named-black border-y border-dark-border"
      >
        <!-- League Header -->
        <div
          class="px-4 py-2 bg-dark-surface flex items-center justify-between"
        >
          <div class="flex items-center space-x-2">
            <span class="text-lg">{{ league.flag }}</span>
            <span class="text-sm font-bold text-gray-200">{{
              league.name
            }}</span>
          </div>
          <Star :size="16" class="text-gray-600" />
        </div>

        <!-- Match Items -->
        <div
          v-for="match in league.matches"
          :key="match.id"
          class="px-4 py-3 border-t border-dark-border first:border-t-0 flex items-center"
        >
          <!-- Time/Status -->
          <div class="w-14 flex flex-col items-center justify-center mr-4">
            <span
              class="text-xs font-bold mb-1"
              :class="getStatusColor(match.status)"
            >
              {{
                match.status === "LIVE"
                  ? match.timeElapsed
                  : match.status === "END"
                  ? "종료"
                  : match.time
              }}
            </span>
            <span
              v-if="match.status === 'LIVE'"
              class="w-1.5 h-1.5 rounded-full bg-named-highlight"
            ></span>
          </div>

          <!-- Teams & Score -->
          <div class="flex-1 flex items-center justify-between">
            <div class="flex items-center space-x-3 flex-1 justify-end">
              <span
                class="text-sm text-gray-200 font-medium text-right truncate"
                >{{ match.home }}</span
              >
            </div>

            <div class="px-3 flex items-center justify-center w-16">
              <span class="text-lg font-bold text-white">{{
                match.homeScore
              }}</span>
              <span class="text-gray-500 mx-1">:</span>
              <span class="text-lg font-bold text-white">{{
                match.awayScore
              }}</span>
            </div>

            <div class="flex items-center space-x-3 flex-1">
              <span class="text-sm text-gray-200 font-medium truncate">{{
                match.away
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
