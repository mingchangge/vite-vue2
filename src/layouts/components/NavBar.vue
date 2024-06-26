<template>
  <div class="navbar">
    <div class="navbar-logo">
      <img src="@/assets/images/logo.png" alt="logo" />
      <span>Electron Vue</span>
    </div>
    <div class="navbar-menu">
      <ul>
        <template v-for="(route, i) of navMenu">
          <li
            :key="i"
            :class="{ active: isActive(route.path) }"
            @click="toPath(route.path)"
          >
            {{ route.name }}
          </li>
        </template>
      </ul>
    </div>
    <div class="navbar-user">12121212</div>
  </div>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      navMenu: [
        { name: "首页", path: "home" },
        { name: "blockChain", path: "blockChain" },
      ],
    };
  },
  watch: {
    $route(to) {
      this.currentRoute = to.path;
    },
  },
  created() {},
  methods: {
    isActive(path) {
      return this.$route.path === `/${path}`;
    },
    toPath(path) {
      this.$router.push(`/${path}`);
    },
  },
};
</script>

<style lang="less" scoped>
.navbar {
  background: #2b6cff;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 52px;
  &-logo {
    flex: 0 0 160px; //不放大 不缩小 固定宽度160px
    text-align: right;
    img {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      vertical-align: text-top;
    }
    span {
      color: #fff;
      font-weight: 600;
      font-size: 16px;
      font-family: "Microsoft YaHei";
      font-style: normal;
      line-height: 32px;
      &::after {
        width: 1px;
        height: 10px;
        margin-left: 10px;
        border: 1px solid #fff;
        content: "";
      }
    }
  }
  &-menu {
    flex: 1 1 auto; //放大 缩小 自动
    height: 100%;
    > ul {
      display: flex;
      justify-content: flex-start;
      height: 100%;
      margin: 0;
      padding: 0;

      > li {
        display: flex;
        align-items: center;
        height: 100%;
        margin: 0 24px;
        padding: 0 6px;
        color: #fff;
        font-weight: 500;
        font-size: 16px;
        font-family: "Microsoft YaHei";
        font-style: normal;
        line-height: 32px;
        cursor: pointer;
        position: relative;

        &:active,
        &:hover {
          color: #fff;
          &::after {
            width: 100%;
            height: 2px;
            background: #fff;
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
          }
        }
      }

      .active {
        color: #fff;
        font-weight: 700;

        &::after {
          width: 100%;
          height: 2px;
          background: #fff;
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
        }
      }
    }
  }
  &-user {
    flex: 0 0 100px; //不放大 不缩小 固定宽度100px
  }
}
</style>
