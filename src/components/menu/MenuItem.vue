<template>
  <div>
    <template v-if="item.group">
      <el-menu-item-group v-for="it in item.group" :key="it.groupName">
        <template #title>
          {{ it.groupName }}
        </template>
        <MenuRender :menuData="it.children" />
      </el-menu-item-group>
    </template>
    <el-menu-item v-else :key="item.menuPath" :index="item.menuPath">
      <i v-if="item.menuIcon" :class="item.menuIcon" />
      <img v-if="item.menuImage" :src="item.menuImage" alt="" />
      <span>{{ item.menuName }}</span>
    </el-menu-item>
  </div>
</template>

<script>
export default {
  name: "MenuItem",
  components: {
    MenuRender: () => import("./MenuRender.vue"),
  },
  props: {
    item: {
      type: Object,
      default: () => {},
    },
  },
};
</script>
