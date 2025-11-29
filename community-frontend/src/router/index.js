import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/community",
      name: "community",
      component: () => import("../views/CommunityView.vue"),
    },
    {
      path: "/livescore",
      name: "livescore",
      component: () => import("../views/LiveScoreView.vue"),
    },
    {
      path: "/betting",
      name: "betting",
      component: () => import("../views/BettingView.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
    },
  ],
});

export default router;
