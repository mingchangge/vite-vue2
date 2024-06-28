<template>
  <el-menu unique-opened router :defaultActive="defaultActive">
    <MenuRender :menuData="menuData" />
  </el-menu>
</template>

<script>
import MenuRender from "./MenuRender.vue";

export default {
  name: "Menu",
  components: {
    MenuRender,
  },
  props: {
    menuData: {
      type: Array,
      default: () => [],
    },
    defaultActive: {
      type: String,
      default: "",
    },
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
};
</script>

<style lang="less" scoped>
.el-menu {
  height: 100%;
}
</style>
