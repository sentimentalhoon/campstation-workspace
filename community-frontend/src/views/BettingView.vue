<script setup>
import { Coins, Trophy } from "lucide-vue-next";
import { ref } from "vue";

const myPoints = ref(5400);

const matches = ref([
  {
    id: 1,
    league: "Premier League",
    home: "Man City",
    away: "Liverpool",
    odds: { home: 2.1, draw: 3.4, away: 3.1 },
    selected: null,
  },
  {
    id: 2,
    league: "La Liga",
    home: "Real Madrid",
    away: "Barcelona",
    odds: { home: 1.95, draw: 3.6, away: 3.5 },
    selected: null,
  },
  {
    id: 3,
    league: "Serie A",
    home: "Juventus",
    away: "AC Milan",
    odds: { home: 2.4, draw: 3.1, away: 2.9 },
    selected: null,
  },
  {
    id: 4,
    league: "Bundesliga",
    home: "Bayern Munich",
    away: "Dortmund",
    odds: { home: 1.6, draw: 4.2, away: 4.8 },
    selected: null,
  },
]);

const selectOdd = (matchId, type) => {
  const match = matches.value.find((m) => m.id === matchId);
  if (match.selected === type) {
    match.selected = null;
  } else {
    match.selected = type;
  }
};

const getSelectedCount = () => matches.value.filter((m) => m.selected).length;
const getTotalOdds = () => {
  const selected = matches.value.filter((m) => m.selected);
  if (selected.length === 0) return 0;
  return selected
    .reduce((acc, curr) => acc * curr.odds[curr.selected], 1)
    .toFixed(2);
};
</script>

<template>
  <div class="bg-black min-h-full pb-24">
    <!-- Points Header -->
    <div
      class="bg-named-black p-4 border-b border-dark-border flex items-center justify-between sticky top-14 z-40"
    >
      <div class="flex items-center space-x-2">
        <Trophy class="text-yellow-500" :size="20" />
        <span class="text-white font-bold">승부예측</span>
      </div>
      <div
        class="flex items-center space-x-2 bg-dark-surface px-3 py-1.5 rounded-full border border-dark-border"
      >
        <Coins class="text-yellow-500" :size="16" />
        <span class="text-white font-bold text-sm"
          >{{ myPoints.toLocaleString() }} P</span
        >
      </div>
    </div>

    <!-- Betting List -->
    <div class="p-4 space-y-4">
      <div
        v-for="match in matches"
        :key="match.id"
        class="bg-named-black rounded-xl overflow-hidden border border-dark-border"
      >
        <div
          class="bg-dark-surface px-4 py-2 flex items-center justify-between"
        >
          <span class="text-xs text-gray-400">{{ match.league }}</span>
          <span class="text-xs text-gray-500">11.30 21:30</span>
        </div>

        <div class="p-4">
          <div
            class="flex justify-between mb-3 text-sm text-gray-300 font-medium"
          >
            <span>{{ match.home }}</span>
            <span>{{ match.away }}</span>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <!-- Home Win -->
            <button
              @click="selectOdd(match.id, 'home')"
              class="flex flex-col items-center justify-center py-3 rounded-lg border transition-all"
              :class="
                match.selected === 'home'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-dark-surface border-dark-border text-gray-400 hover:bg-gray-800'
              "
            >
              <span class="text-xs mb-1">승</span>
              <span class="font-bold">{{ match.odds.home.toFixed(2) }}</span>
            </button>

            <!-- Draw -->
            <button
              @click="selectOdd(match.id, 'draw')"
              class="flex flex-col items-center justify-center py-3 rounded-lg border transition-all"
              :class="
                match.selected === 'draw'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-dark-surface border-dark-border text-gray-400 hover:bg-gray-800'
              "
            >
              <span class="text-xs mb-1">무</span>
              <span class="font-bold">{{ match.odds.draw.toFixed(2) }}</span>
            </button>

            <!-- Away Win -->
            <button
              @click="selectOdd(match.id, 'away')"
              class="flex flex-col items-center justify-center py-3 rounded-lg border transition-all"
              :class="
                match.selected === 'away'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-dark-surface border-dark-border text-gray-400 hover:bg-gray-800'
              "
            >
              <span class="text-xs mb-1">패</span>
              <span class="font-bold">{{ match.odds.away.toFixed(2) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Betting Slip (Floating) -->
    <div
      v-if="getSelectedCount() > 0"
      class="fixed bottom-16 left-0 right-0 z-40 px-4"
    >
      <div
        class="max-w-[640px] mx-auto bg-blue-600 rounded-xl p-4 shadow-lg text-white flex items-center justify-between"
      >
        <div>
          <div class="text-xs opacity-80 mb-1">
            {{ getSelectedCount() }}개 선택됨
          </div>
          <div class="font-bold text-lg">배당률 {{ getTotalOdds() }}</div>
        </div>
        <button
          class="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100"
        >
          배팅하기
        </button>
      </div>
    </div>
  </div>
</template>
