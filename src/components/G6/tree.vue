<template>
  <div :class="className" />
</template>

<script>
export default {
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    treeData: {
      type: Object,
      required: true
    },
    className: {
      type: String,
      default: 'chart'
    }
  },
  data() {
    return {
      graphInstance: null,
      optionConfig: undefined
    }
  },
  watch: {
    treeData: {
      handler(newVal) {
        if (newVal) {
          if (this.graphInstance) {
            // 清除画布元素。该方法一般用于清空数据源，重新设置数据源，重新 render 的场景，此时所有的图形都会被清除。
            this.graphInstance.clear()
            // 更新数据源，根据新的数据重新渲染视图。
            this.graphInstance.changeData(newVal)
          } else {
            this.initGraph()
          }
        }
      },
      deep: true
    }
  },
  created() {
    // 在组件创建完毕后，调用初始化方法
    this.$nextTick(() => {
      this.initGraph()
    })
  },
  beforeDestroy() {
    if (!this.graphInstance) {
      return
    }
    this.graphInstance.destroy()
    this.graphInstance = null
  },
  methods: {
    initGraph() {
      // 设置容器宽高
      const width = this.$el.scrollWidth || 600
      const height = this.$el.scrollHeight || 600
      // 设置配置项
      this.optionConfig = this.options
      this.optionConfig.container = this.$el
      this.optionConfig.width = width
      this.optionConfig.height = height
      // 创建树图实例
      this.graphInstance = new this.$G6.TreeGraph(this.optionConfig)
      // 渲染树图
      this.graphInstance.data(this.treeData)
      this.graphInstance.on('afterlayout', () => {
        this.$emit('afterLayout')
      })
      this.graphInstance.render()

      // 监听屏幕变化，重新渲染
      if (typeof window !== 'undefined')
        window.onresize = () => {
          if (!this.graphInstance || this.graphInstance.get('destroyed')) return
          if (!this.$el || !this.$el.scrollWidth || !this.$el.scrollHeight)
            return
          this.graphInstance.changeSize(
            this.$el.scrollWidth,
            this.$el.scrollHeight
          )
        }
    }
  }
}
</script>

<style lang="less">
.chart {
  display: flex;
  justify-content: center;
}

/* 提示框的样式 */
.g6-tooltip {
  padding: 10px 8px;
  color: #545454;
  font-size: 14px;
  line-height: 28px;
  background-color: rgb(255 255 255 / 90%);
}
</style>
