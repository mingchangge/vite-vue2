<template>
  <div class="menu-page">
    <div class="menu-page-left">
      <Menu :menuData="menuList" :default-active="defaultActive" />
    </div>
    <div class="menu-page-right">
      <router-view />
    </div>
  </div>
</template>

<script>
import Menu from "@/components/menu/index.vue";
export default {
  name: "MenuPage",
  components: {
    Menu,
  },
  data() {
    return {
      defaultActive: "/menu-page/menu-page-1",
      menuList: [
        {
          menuName: "AAA",
          menuPath: "/menu-page/menu-page-1",
          menuIcon: "el-icon-s-home",
          menuImage: "",
        },
        {
          menuName: "BBB",
          menuIcon: "el-icon-s-data",
          menuImage: "",
          children: [
            {
              menuName: "BBB-1",
              children: [
                {
                  menuName: "BBB-1-1",
                  menuPath: "/menu-page/menu-page-b1",
                },
                {
                  menuName: "BBB-1-2",
                  menuPath: "/menu-page/menu-page-b12",
                },
              ],
            },
            {
              menuName: "BBB-2",
              menuPath: "/menu-page/menu-page-b2",
            },
          ],
        },
        {
          menuName: "CCC",
          menuIcon: "el-icon-s-order",
          children: [
            {
              group: [
                {
                  groupName: "CCC-1",
                  children: [
                    {
                      menuName: "CCC-1-1",
                      menuPath: "/menu-page/menu-page-c11",
                      menuIcon: "el-icon-s-order",
                    },
                    {
                      menuName: "CCC-1-2",
                      menuPath: "/menu-page/menu-page-c12",
                      menuIcon: "el-icon-s-order",
                    },
                  ],
                },
                {
                  groupName: "CCC-2",
                  children: [
                    {
                      menuName: "CCC-2-1",
                      menuPath: "/menu-page/menu-page-c21",
                      menuIcon: "el-icon-s-order",
                    },
                    {
                      menuName: "CCC-2-2",
                      menuPath: "/menu-page/menu-page-c22",
                      menuIcon: "el-icon-s-order",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  },
  created() {},
};
</script>

<style lang="less" scoped>
.menu-page {
  display: flex;
  height: 100%;
  &-left {
    width: 200px;
    height: 100%;
    background: #fff;
  }
  &-right {
    flex: 1;
    background: #fff;
  }
}
</style>
