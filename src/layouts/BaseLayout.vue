<template>
  <div class="base-layout">
    <NavBar />
    <div class="base-layout-main">
      <router-view />
    </div>
  </div>
</template>

<script>
import NavBar from "./components/NavBar";

export default {
  name: "BaseLayout",
  components: {
    NavBar,
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
};
</script>

<style lang="less" scoped>
.base-layout {
  width: 100%;
  height: 100%;
  &-main {
    width: 100%;
    height: calc(100vh - 37px - 52px);
    overflow: hidden;
    background: #f7f8fa;
  }
}
</style>
