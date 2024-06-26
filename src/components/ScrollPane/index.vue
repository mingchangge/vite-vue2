<template>
  <el-scrollbar
    ref="scrollContainer"
    :vertical="false"
    class="scroll-container"
    @wheel.native.prevent="handleScroll"
  >
    <slot />
  </el-scrollbar>
</template>

<script>
export default {
  name: "ScrollPane",
  data() {
    return {
      left: 0,
    };
  },
  computed: {
    scrollWrapper() {
      return this.$refs.scrollContainer.$refs.wrap;
    },
  },
  mounted() {
    this.scrollWrapper.addEventListener("scroll", this.emitScroll, true);
  },
  beforeDestroy() {
    this.scrollWrapper.removeEventListener("scroll", this.emitScroll);
  },
  methods: {
    handleScroll(e) {
      const eventDelta = e.wheelDelta || -e.deltaY * 40;
      const $scrollWrapper = this.scrollWrapper;
      $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4;
    },
  },
};
</script>

<style lang="less" scoped>
.scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;

  :deep(.el-scrollbar__wrap) {
    height: 51px;
    overflow: hidden;
  }

  :deep(.el-scrollbar__bar) {
    bottom: 0;
    z-index: 3;

    &.is-vertical {
      display: none !important;
    }
  }
}
</style>
