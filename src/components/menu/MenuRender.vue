<template>
  <div>
    <template v-for="item in menuData">
      <el-submenu
        v-if="item.children && item.children.length > 0"
        :key="item.menuName"
        :index="item.menuPath || item.menuName"
      >
        <template #title>
          <i v-if="item.menuIcon" :class="item.menuIcon" />
          <img v-if="item.menuImage" :src="item.menuImage" alt="" />
          <span slot="title">{{ item.menuName }}</span>
        </template>
        <MenuRender :menuData="item.children" />
      </el-submenu>
      <MenuItem v-else :item="item" :key="item.menuPath" />
    </template>
  </div>
</template>

<script>
import MenuItem from "./MenuItem.vue";

export default {
  name: "MenuRender",
  components: {
    MenuItem,
  },
  props: {
    menuData: {
      type: Array,
      default: () => [],
    },
  },
  methods: {},
};
</script>
