import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
//添加以下代码
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const routes = [
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
];

export const router = new VueRouter({
  mode: "hash",
  routes,
});
