const {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  session,
} = require("electron");

const path = require("path");
const log = require("electron-log");

// 记录每个窗口的BrowserView
//  key: BrowserWindow.id
//  value:  map{app_key1: browserView1, app_key2: browserView2, ...}
let browserViewMap = {};

// home窗口的最大高度
let homeMaxHeight = 36;

// 根据event以及args获取窗口和BrowserView
function getWindowAndBrowserView(event, args) {
  let window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    const browserViewList = browserViewMap[window.id];
    if (args && browserViewList) {
      const browserView = browserViewList[args.applicationKey];
      return {
        window,
        browserView,
      };
    } else {
      return {
        window,
      };
    }
  }
}

// 由event以及args创建BrowserView
function createBrowserView(event, arg) {
  let { window } = getWindowAndBrowserView(event);
  if (!window) {
    log.error("window not found for event");
    return;
  }
  log.info(`create-browser-view ${window.id} ${arg.applicationKey}`);
  const [width, height] = window.getSize();
  const browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "spinner.js"),
    },
  });
  browserView.setAutoResize({
    width: true,
    height: true,
  });
  browserView.webContents.on("did-start-loading", () => {
    browserView.webContents.send("loading-show");
  });
  browserView.webContents.on("did-stop-loading", () => {
    browserView.webContents.send("loading-hide");
  });
  browserView.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      browserView.webContents.send(
        "fail-load",
        JSON.stringify({
          errorCode,
          errorDescription,
          validatedURL,
          isMainFrame,
        })
      );
    }
  );

  browserView.webContents.loadURL(arg.applicationUrl).then(() => {
    log.info("loadURL success");
  });

  window.addBrowserView(browserView);

  browserView.setBounds({
    x: 0,
    y: homeMaxHeight,
    width,
    height: height - homeMaxHeight,
  });
  // if (!app.isPackaged) {
  //   globalShortcut.register('CmdOrCtrl+Alt+V', () => {
  //     utils.DEVTOOLS(browserView)
  //   })
  // }
  browserViewMap[window.id] = browserViewMap[window.id] || {};
  browserViewMap[window.id][arg.applicationKey] = browserView;
}
/**
 * 打开或关闭开发者工具
 * @param {BrowserView} browserView--[browserView.webContents, event.sender]
 * @returns {void}
 */
function toggleDevTools(browserView) {
  const isOpen = browserView.isDevToolsOpened();
  if (isOpen) {
    browserView.closeDevTools();
  } else {
    browserView.openDevTools();
  }
}
function destroyBrowserView(window) {
  if (browserViewMap[window.id]) {
    for (let key in browserViewMap[window.id]) {
      let browserView = browserViewMap[window.id][key];
      window.removeBrowserView(browserView);
      browserView.webContents.destroy();
    }
    delete browserViewMap[window.id];
  }
}

function installCFCAExtension() {
  const extensionPath = __dirname.split("app.asar")[0] + "static/cfca";
  const url = app.isPackaged
    ? extensionPath
    : path.join(__dirname, "../public/cfca");
  session.defaultSession
    .loadExtension(url)
    .then(({ id }) => {
      log.info("load extension 成功!", url, id);
    })
    .catch((err) => log.error("load extension 失败!", url, err));
}

function initTab() {
  ipcMain.on("changeTab-browser-view", (event, arg) => {
    let { window, browserView } = getWindowAndBrowserView(event, arg);
    if (browserView) {
      log.info(`changeTab-browser-view ${window.id} ${arg.applicationKey}`);
      window.addBrowserView(browserView);
    }
  });

  ipcMain.on("home-browser-view", (event) => {
    let { window } = getWindowAndBrowserView(event);
    if (window) {
      log.info(`home-browser-view, window: ${window.id}`);
      window.setBrowserView(null);
    }
  });

  ipcMain.on("create-browser-view", (event, arg) => {
    createBrowserView(event, arg);
    installCFCAExtension();
  });
  ipcMain.on("toggle-dev-tools", (event, arg) => {
    // window窗口的开发者工具
    if (!arg || arg.applicationKey === "Home") {
      toggleDevTools(event.sender);
      return;
    }
    // browserView的开发者工具
    let { window, browserView } = getWindowAndBrowserView(event, arg);
    if (browserView) {
      log.info(`toggle-dev-tools ${window.id} ${arg.applicationKey}`);
      toggleDevTools(browserView.webContents);
    }
  });
  ipcMain.on("close-browser-view", (event, arg) => {
    let { window, browserView } = getWindowAndBrowserView(event, arg);
    if (browserView) {
      log.info(`close-browser-view ${window.id} ${arg.applicationKey}`);
      window.removeBrowserView(browserView);
      browserView.webContents.destroy();
      delete browserViewMap[window.id][arg.applicationKey];
    }
  });
}

exports.initTab = initTab;
exports.destroyBrowserView = destroyBrowserView;
