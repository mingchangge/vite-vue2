import Vue from "vue";
import VueRouter from "vue-router";
import BaseLayout from "@/layouts/BaseLayout.vue";
import commonRouteModules from "./modules";

Vue.use(VueRouter);
//添加以下代码
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const routes = [
  {
    path: "/",
    component: BaseLayout,
    redirect: "/home",
    children: [...commonRouteModules],
  },
  // {
  //   path: '/login',
  //   component: () => import('@/views/login-page')
  // }
];

export const router = new VueRouter({
  mode: "hash",
  routes,
});
