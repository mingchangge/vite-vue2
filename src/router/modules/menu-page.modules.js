export default [
  {
    path: "esm-commonjs-page",
    component: () =>
      import("@/views/esm-commonjs-page/DifferenceEsmCommonjs.vue"),
    meta: { title: "ESM & CommonJS的不同" },
  },
  {
    path: "order-tree-graph",
    component: () => import("@/views/order-tree-graph"),
    children: [
      {
        path: "20240718",
        component: () => import("@/views/order-tree-graph/20240718.vue"),
        meta: { title: "树图-20240718" },
      },
      {
        path: "20240719",
        component: () => import("@/views/order-tree-graph/20240719.vue"),
        meta: { title: "树图-20240719" },
      },
    ],
    meta: { title: "树图" },
  },
  {
    path: "imperative-components-page",
    component: () => import("@/views/imperative-components-page/index.vue"),
    meta: { title: "命令式组件" },
  },
];
