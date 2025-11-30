<script setup>
import { Calendar, ChevronLeft, ChevronRight, Star } from "lucide-vue-next";
import { onMounted, ref } from "vue";

const formatDate = () => {
  const date = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dayOfWeek = days[date.getDay()];
  return `${month}.${day} (${dayOfWeek})`;
};

const currentDate = ref(formatDate());
const leagues = ref([]);

const getStatusColor = (status) => {
  switch (status) {
    case "LIVE":
      return "text-named-highlight animate-pulse";
    case "FINISHED":
    case "END":
      return "text-gray-500";
    default:
      return "text-gray-400";
  }
};

const fetchLiveMatches = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || "/api/community";
    const response = await fetch(`${baseUrl}/api/sports/live`);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    // Group by league
    const grouped = {};
    data.forEach((match) => {
      if (!grouped[match.league]) {
        grouped[match.league] = {
          id: match.league,
          name: match.league,
          country: "World", // 추후 API에서 국가 정보 제공 필요
          flag: "⚽",
          matches: [],
        };
      }

      // Parse time
      const timeStr = match.startTime ? match.startTime.substring(11, 16) : "";

      grouped[match.league].matches.push({
        id: match.id,
        time: timeStr,
        status: match.status,
        home: match.homeTeam,
        away: match.awayTeam,
        homeScore: match.homeScore || 0,
        awayScore: match.awayScore || 0,
        timeElapsed: match.status === "LIVE" ? "LIVE" : "",
        startTime: match.startTime,
      });
    });

    // Sort matches by time within each league
    const leaguesArray = Object.values(grouped);
    leaguesArray.forEach((league) => {
      league.matches.sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return new Date(a.startTime) - new Date(b.startTime);
      });
    });

    leagues.value = leaguesArray;
  } catch (error) {
    console.error("Failed to fetch live matches:", error);
    // Fallback to dummy data if fetch fails (for demo purposes)
    const now = new Date();
    leagues.value = [
      {
        id: 1,
        name: "Premier League",
        country: "England",
        flag: "🇬🇧",
        matches: [
          {
            id: 101,
            time: now.toTimeString().substring(0, 5),
            status: "LIVE",
            home: "Man City",
            away: "Liverpool",
            homeScore: 1,
            awayScore: 1,
            timeElapsed: "34'",
            startTime: now.toISOString(),
          },
        ],
      },
    ];
  }
};

onMounted(() => {
  fetchLiveMatches();
});
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
