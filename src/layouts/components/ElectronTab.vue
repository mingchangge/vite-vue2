<template>
  <div id="app">
    <div
      v-if="isElectron"
      class="tab-container"
      :style="{
        paddingLeft: isMac ? '100px' : '0',
        paddingRight: isWin ? '100px' : '0',
      }"
    >
      <ScrollPane ref="scrollPane" :key="tabStore.tabKey">
        <ul class="tabs clearfix">
          <li
            v-for="tab in tabStore.tabData"
            :key="tab.applicationKey"
            class="tab"
            :class="{ active: tab.isActive, previous: tab.isPrevious }"
            @click="tabStore.changeTab(tab)"
          >
            <a href="#">
              <div class="tanIcons">
                <img
                  :src="
                    tab.applicationIcon
                      ? getAssetsFile(tab.applicationIcon)
                      : getAssetsFile('images/icon_20*20.png')
                  "
                />
              </div>
              {{ tab.applicationName }}</a
            >
            <div
              v-if="isDev"
              class="devTools"
              @click.stop="tabStore.toggleDevTools(tab)"
            >
              <el-tooltip
                class="item"
                effect="dark"
                content="开发者模式"
                placement="bottom-start"
              >
                <img
                  :src="getAssetsFile('icons/devMode.svg')"
                  style="width: 16px; height: 16px"
                />
              </el-tooltip>
            </div>
            <div
              v-if="tab.showClose"
              class="close"
              @click.stop="tabStore.closeTab(tab)"
            ></div>
          </li>
        </ul>
      </ScrollPane>
    </div>
    <div v-show="tabStore.activeKey === 'Home'" class="application-container">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import ScrollPane from "@/components/ScrollPane";
import { useElectronTabStore } from "@/store/modules/electronTab";

export default {
  name: "ElectronTab",
  components: {
    ScrollPane,
  },
  data() {
    return {
      tabStore: useElectronTabStore(),
      isElectron: false,
      isMac: false,
      isWin: false,
      isDev: false,
    };
  },
  created() {
    // 判断是否是mac系统
    this.isMac = /macintosh|mac os x/i.test(navigator.userAgent);
    this.isWin = /windows|win32/i.test(navigator.userAgent);
    this.isElectron = window.electronAPI;
    if (!this.isElectron) return;
    this.isDev = import.meta.env.MODE === "dev";
    this.tabStore.$patch({
      tabData: this.tabStore.applicationData.filter((app) => app.isVisible),
    });
    this.tabStore.openApplication(this.tabStore.tabData[0]);
  },
  methods: {
    getAssetsFile(url) {
      return new URL(`../../assets/${url}`, import.meta.url).href;
    },
  },
};
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-container {
  display: flex;
  align-content: center;
  max-height: 36px;
  margin: 0;
  padding: 0 100px;
  overflow: hidden;
  background: #d3e3fd;
  border-bottom: 1px solid #d3d4d6;
  user-select: none;
  -webkit-app-region: drag;

  .tabs {
    display: flex;
    flex: 1;
    height: 35px;
    margin: 0;
    padding-right: 20px;
    line-height: 35px;
    list-style-type: none;

    .tab {
      position: relative;
      box-sizing: content-box;
      min-width: 150px;
      height: 170px;
      margin: 5px -10px 0 0;
      padding: 0 30px 0 25px;
      background: #d3e3fd;
      border-top-left-radius: 20px 90px;
      border-top-right-radius: 25px 170px;
      box-shadow: 0 10px 20px rgb(211 227 253 / 50%);
      -webkit-app-region: no-drag;

      a {
        position: relative;
        display: block;
        box-sizing: border-box;
        width: 100%;
        height: 30px;
        padding-left: 25px;
        overflow: hidden;
        color: #3c3a3a;
        font-size: 14px;
        line-height: 30px;
        text-decoration: none;
        text-overflow: ellipsis;

        .tanIcons {
          position: absolute;
          top: 5px;
          left: 0;
          width: 20px;
          height: 20px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            vertical-align: top;
          }
        }
      }

      .devTools {
        position: absolute;
        top: 1px;
        right: 46px;
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      .close {
        position: absolute;
        top: 8px;
        right: 20px;
        z-index: 99;
        width: 16px;
        height: 15px;
        background: url("../../assets/images/close_tab.png") no-repeat center;
        cursor: pointer;
      }

      &::after {
        position: absolute;
        top: 6px;
        right: 10px;
        width: 2px;
        height: 16px;
        background: #fff;
        content: "";
      }
    }

    .previous {
      &::after {
        background: transparent;
      }
    }

    .active {
      //z-index: 2;
      background: #fff;

      &::before,
      &::after {
        position: absolute;
        top: 0;
        width: 20px;
        height: 20px;
        background: transparent;
        border-style: solid;
        border-width: 10px;
        border-radius: 100%;
        content: "";
      }

      &::before {
        left: -23px;
        border-color: transparent #fff transparent transparent;
        transform: rotate(48deg);
      }

      &::after {
        right: -17px;
        background: transparent;
        border-color: transparent transparent transparent #fff;
        transform: rotate(-48deg);
      }
    }
  }
}

.application-container {
  height: 100%;
  overflow: auto;
}
</style>
