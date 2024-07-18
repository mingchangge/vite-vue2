<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
export default {
  name: "EchartsComponent",
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "350px",
    },
  },
  data() {
    return {
      // echarts实例
      chartInstance: null,
    };
  },
  watch: {
    options: {
      handler(newVal) {
        if (newVal && this.chartInstance) {
          this.chartInstance.dispose();
          this.chartInstance = null;
          // 解决表单重置时，图表有时候渲染错误
          if (document.getElementsByClassName("chart").length > 0) {
            for (
              let i = 0;
              i < document.getElementsByClassName("chart").length;
              i++
            ) {
              document
                .getElementsByClassName("chart")
                [i].removeAttribute("_echarts_instance_");
            }
          }
          this.initChart();
        }
      },
      deep: true,
    },
  },
  created() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chartInstance) {
      return;
    }
    this.chartInstance.dispose();
    this.chartInstance = null;
  },
  methods: {
    initChart() {
      this.chartInstance = this.$eCharts.init(this.$el);
      this.chartInstance.setOption(this.options);
    },
  },
};
</script>

<style lang="less" scoped>
.chart {
  width: 100%;
  height: 350px;
}
</style>
