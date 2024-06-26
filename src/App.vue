<template>
  <div id="app">
    <ElectronTab>
      <router-view />
    </ElectronTab>
  </div>
</template>

<script>
import ElectronTab from "@/layouts/components/ElectronTab";

export default {
  name: "App",
  components: {
    ElectronTab,
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
};
</script>

<style lang="less" scoped>
.custom-titlebar {
  /* 标题栏始终在最顶层（避免后续被 Modal 之类的覆盖） */
  display: flex;
  /* 避免被收缩 */
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  /* 高度与 main.js 中 titleBarOverlay.height 一致  */
  height: 36px;
  padding-left: 12px;
  color: #1d2129;
  font-size: 14px;
  background: #d3e3fd;
  border-bottom: 1px solid #d3d4d6;
  user-select: none;

  /* 设置该属性表明这是可拖拽区域，用来移动窗口 */
  -webkit-app-region: drag;
}
</style>
