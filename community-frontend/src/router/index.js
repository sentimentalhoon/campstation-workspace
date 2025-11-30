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
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterBlacklistView.vue"),
    },
    {
      path: "/detail/:id",
      name: "detail",
      component: () => import("../views/BlacklistDetailView.vue"),
    },
    {
      path: "/community",
      name: "community",
      component: () => import("../views/CommunityView.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
    },
  ],
});

export default router;
