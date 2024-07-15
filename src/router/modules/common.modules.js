// 可导入多个模块，每个模块对应一个路由模块
import menuPageModules from "@/router/modules/menu-page.modules";

export default [
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/blockChain",
    name: "BlockChain",
    component: () => import("@/views/fhevm"),
  },
  {
    path: "/menu-page",
    name: "MenuPage",
    component: () => import("@/views/menu-page"),
    meta: { title: "菜单页面" },
    redirect: "/menu-page/esm-commonjs-page",
    children: [...menuPageModules],
  },
];
