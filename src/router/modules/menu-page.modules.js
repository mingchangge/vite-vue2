export default [
  {
    path: "esm-commonjs-page",
    component: () =>
      import("@/views/esm-commonjs-page/DifferenceEsmCommonjs.vue"),
    meta: { title: "ESM & CommonJS的不同" },
  },
  {
    path: "imperative-components-page",
    component: () => import("@/views/imperative-components-page/index.vue"),
    meta: { title: "命令式组件" },
  },
];
