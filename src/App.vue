<template>
  <div id="app">
    <div
      v-if="isElectron"
      :class="['custom-titlebar', isMac ? 'mac' : 'win']"
    />
    <el-container class="wrapper">
      <el-aside width="200px">
        <el-menu :default-active="menuActive" router>
          <el-menu-item index="/home">
            <i class="el-icon-menu"></i>
            <span slot="title">首页</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      menuActive: "/home",
      isElectron: undefined,
      isMac: false,
    };
  },
  created() {
    console.log("created");
    // 判断是否是mac系统
    let isMac = /macintosh|mac os x/i.test(navigator.userAgent);
    let isWin = /windows|win32/i.test(navigator.userAgent);
    this.isElectron = window.electronAPI;
    this.isMac = window.electronAPI && !isWin && isMac;
  },
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
.wrapper {
  width: 100%;
  height: calc(100vh - 37px);
  background: #d3d4d6;
  overflow: hidden;
  .el-aside {
    height: 100%;
    background: #fff;
    .el-menu {
      height: 100%;
    }
  }
}
</style>
