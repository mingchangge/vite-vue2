import { defineStore } from "pinia";

export const useElectronTabStore = defineStore("electronTabs", {
  state: () => ({
    applicationData: [
      {
        applicationKey: "Home",
        applicationName: "Demo",
        applicationIcon: "",
        applicationUrl: "",
        isActive: true,
        isVisible: true,
        showClose: false,
        isPrevious: false, //样式控制
      },
    ],
    tabKey: 0, //用于刷新页面
    activeKey: "Home",
    tabData: [],
  }),
  actions: {
    changeActive(application) {
      if (!window.electronAPI) return;
      // 当前要切换的tab与当前选中的tab相同时，不进行任何操作
      if (application.applicationKey === this.activeKey) {
        return;
      }
      // 判断当前要切换的tab是否已经存在
      let isExist = this.applicationData.some(
        (item) => item.applicationKey === application.applicationKey
      );
      if (isExist) {
        this.applicationData.forEach((item, i) => {
          if (item.applicationKey === application.applicationKey) {
            item.isActive = true;
            item.isVisible = true;
            //当前打开Tab页面在applicationData数据里存在Key相同、名称不同，更新名称applicationData数据
            if (item.applicationName !== application.applicationName) {
              item.applicationName = application.applicationName;
              item.applicationUrl = application.applicationUrl;
              item.applicationIcon = application.applicationIcon;
            }
            if (i - 1 >= 0) {
              this.applicationData[i - 1].isPrevious = true;
            }
          } else {
            item.isActive = false;
            item.isPrevious = false;
          }
        });
      } else {
        this.applicationData.forEach((item) => {
          item.isActive = false;
          item.isPrevious = false;
          return item;
        });
        // 新增的tab
        this.applicationData[this.applicationData.length - 1].isPrevious = true;
        this.applicationData.push(application);
        console.log(this.applicationData, "this.applicationData");
      }
      this.activeKey = application.applicationKey;
      this.tabData = [];
      this.tabData = this.applicationData.filter((app) => app.isVisible);
    },
    /**
     * 切换标签页时触发
     */
    changeTab(application) {
      this.changeActive(application);
      if (application.applicationKey === "Home") {
        window.electronAPI.sendChangeBrowserView("home-browser-view", {
          applicationKey: application.applicationKey,
          applicationUrl: application.applicationUrl,
        });
        return;
      }
      window.electronAPI.sendChangeBrowserView("changeTab-browser-view", {
        applicationKey: application.applicationKey,
        applicationUrl: application.applicationUrl,
      });
    },
    /**
     * 打开标签页
     */
    openApplication(application) {
      this.changeActive(application);
      if (application.applicationKey === "Home") {
        window.electronAPI.sendChangeBrowserView("home-browser-view", {
          applicationKey: application.applicationKey,
          applicationUrl: application.applicationUrl,
        });
        return;
      }
      window.electronAPI.sendChangeBrowserView("create-browser-view", {
        applicationKey: application.applicationKey,
        applicationUrl: application.applicationUrl,
      });
    },
    toggleDevTools(application) {
      window.electronAPI.sendChangeBrowserView("toggle-dev-tools", {
        applicationKey: application.applicationKey,
        applicationUrl: application.applicationUrl,
      });
    },
    /**
     * 关闭标签页
     */
    closeTab(application) {
      this.applicationData.forEach((app, i) => {
        if (app.applicationKey === application.applicationKey) {
          //关闭元素的下标
          let index = this.tabData.indexOf(application);
          //当前选中的元素下标
          let activeIndex = this.tabData.findIndex(
            (item) => item.applicationKey === this.activeKey
          );
          if (activeIndex == index) {
            let previous = this.tabData[index - 1];
            this.changeTab(previous);
            this.activeKey = previous.applicationKey;
          }
          app.isVisible = false;
          app.isActive = false;
          this.tabKey++;
          //删除当前元素,避免Tab页签打开顺序错乱
          this.applicationData.splice(i, 1);
        }
      });
      this.tabData = this.applicationData.filter((app) => app.isVisible);
      window.electronAPI.sendChangeBrowserView("close-browser-view", {
        applicationKey: application.applicationKey,
        applicationUrl: application.applicationUrl,
      });
    },
  },
});
