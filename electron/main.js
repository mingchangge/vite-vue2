// 控制应用生命周期和创建原生浏览器窗口的模组
const {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  protocol,
  dialog,
  nativeTheme,
  screen,
} = require("electron");

const { autoUpdater } = require("electron-updater");
const { release } = require("node:os");
const path = require("path");
const fs = require("fs");
const log = require("electron-log");
const store = require("electron-store");
const { initTab, destroyBrowserView } = require("./tabs");

const isMac = process.platform === "darwin";
const isDev = process.env.npm_lifecycle_script.includes("dev");
const appConfig = new store();

// From https://www.electronjs.org/docs/latest/api/menu
const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  // { role: 'editMenu' }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
            },
          ]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },
  // { role: 'viewMenu' }
  ...(isDev
    ? [
        {
          label: "View",
          submenu: [
            { role: "reload" },
            { role: "forceReload" },
            { role: "toggleDevTools" },
            { type: "separator" },
            { role: "resetZoom" },
            { role: "zoomIn" },
            { role: "zoomOut" },
            { type: "separator" },
            { role: "toggleFullscreen" },
          ],
        },
      ]
    : []),
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true, stream: true } },
]);
// 禁用 Windows 7 的 GPU 加速
if (release().startsWith("6.1")) app.disableHardwareAcceleration();
// 为 Windows 10+ 通知设置应用程序名称
if (process.platform === "win32") app.setAppUserModelId(app.getName());
//
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let userIndex = 0;
let updateInProcess = false;
let updateConfirmed = false;

let appId = app.getName();
// 检查更新
function startUpdater() {
  if (!app.isPackaged) {
    return;
  }

  autoUpdater.setFeedURL({
    provider: "generic",
    url: `https://assets.webterren.com/public/${appId}/`,
  });

  // 更新检查定时任务
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 1000 * 60 * 5);

  // 启动就检查一次更新
  autoUpdater.checkForUpdates();
  autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    updateInProcess = true;

    // 程序运行期间，多次下载更新，只提醒一次。
    if (updateConfirmed) {
      return;
    }

    const dialogOpts = {
      type: "info",
      buttons: ["退出并更新", "稍后更新"],
      title: "演示更新",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail: "演示新版本已经发布， 退出程序后将自动安装更新。",
    };

    dialog.showMessageBox(mainWindow, dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall();
      updateConfirmed = true;
    });
  });
}

// let landingPage = isDev ? "#home" : "#login";
let landingPage = "#home";
let mainURLRoot = app.isPackaged
  ? `file://${path.join(__dirname, "../dist-vite/index.html")}`
  : `${process.env.VITE_DEV_SERVER_URL}`;

let mainURL = mainURLRoot + landingPage;

console.log("mainURL", mainURL);

// 创建浏览器窗口
async function createWindow() {
  // 创建浏览器窗口
  const partition = "persist:user-" + userIndex;
  userIndex++;

  let mWindow = new BrowserWindow({
    show: false,
    width: loginWindowSize.width,
    height: loginWindowSize.height,
    minWidth: 1000,
    minHeight: 800,
    backgroundColor: "#d3e3fd",
    webPreferences: {
      spellcheck: false,
      nodeIntegration: true, //在渲染进程启用Node.js
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: isDev ? false : true,
      partition: partition,
    },
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#d3e3fd",
      height: 34,
      symbolColor: "#1d2129",
    },
  });

  mWindow.loadURL(mainURL);
  mWindow.once("ready-to-show", () => {
    const savedBounds = appConfig.get("bounds");
    if (savedBounds !== undefined) {
      const screenArea = screen.getDisplayMatching(savedBounds).workArea;
      if (
        savedBounds.x > screenArea.x + screenArea.width ||
        savedBounds.x < screenArea.x ||
        savedBounds.y < screenArea.y ||
        savedBounds.y > screenArea.y + screenArea.height
      ) {
        mWindow.setBounds({ x: 0, y: 0 });
      } else {
        mWindow.setBounds(savedBounds);
      }
    }
    mWindow.show();
    // mWindow.send('loading-show')
  });

  mWindow.on("close", (e) => {
    const winBounds = mWindow.getBounds();
    appConfig.set("bounds", winBounds);

    // 未打包的模式下，不弹出提示
    if (!app.isPackaged) {
      return;
    }

    if (updateInProcess) {
      return;
    }
    var response = dialog.showMessageBoxSync({
      type: "question",
      title: "提示",
      message: "您确定要退出 演示 吗？",
      buttons: ["是", "否"],
    });
    if (response == 0) {
      // 点击是
      // 关闭窗口不做处理，保持默认行为：
      // windows下会自动退出，macOS下会隐藏窗口
    } else {
      // 点击否
      e.preventDefault();
    }
  });
  // Test actively push message to the Electron-Renderer
  mWindow.webContents.on("did-finish-load", () => {
    mWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );

    // macOS上第一次打开时，检查是否有scheme传入
    if (deeplinkingURL) {
      mWindow.webContents.send("scheme-change", deeplinkingURL);
      deeplinkingURL = null;
    }

    // windows上第一次打开时，检查是否有scheme传入
    // 因为open-url事件只有macOS才支持
    if (process.platform === "win32" && userIndex == 1) {
      const url = process.argv[process.argv.length - 1];
      if (url.startsWith(defaultProtocol)) {
        mWindow.webContents.send("scheme-change", url);
      }
    }
  });
  //渲染器进程意外消失时触发。 这种情况通常因为进程崩溃或被杀死
  mWindow.webContents.on("render-process-gone", (event, details) => {
    log.error("render-process-gone", details);
    // 开发模式下，vite-plugin-electron插件会负责重启，会杀死当前进程
    // 因此遇到这个错误的时候，直接退出即可
    // ref: https://code.webterren.com/dist-vite-Terren/ChainTradeClient/pulls/579#issuecomment-1260997
    process.exit(0);
  });
  //渲染进程不响应时触发
  mWindow.webContents.on("unresponsive", () => {
    log.error("unresponsive");
    const options = {
      type: "info",
      title: "渲染器进程挂起",
      message: "这个进程已经被挂起.",
      buttons: ["重载", "关闭"],
    };
    dialog.showMessageBox(options, function (index) {
      if (index === 0) mWindow.reload();
      else mWindow.close();
    });
  });
  // Make all links open with the browser, not with the application
  mWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:"))
      shell.openExternal(url);
    return { action: "deny" };
  });

  if (!mainWindow) {
    mainWindow = mWindow;
  }

  return new Promise((resolve) => {
    resolve(mWindow);
  });
}

const loginWindowSize = { width: 1170, height: 850 };
const mainWindowSize = { width: 1800, height: 1000 };
// 计算窗口大小
function calculateSize() {
  // 探测屏幕测尺寸
  const electron = require("electron");
  let dimension = electron.screen.getPrimaryDisplay().size;

  // 使用探测到的屏幕大小，但是不要使用太大的尺寸
  // 因为目前应用的设计主要是用1080p的屏幕为主的
  // 设置太大的尺寸的屏幕，例如iMac 27'上就太大了
  // 而对于小屏幕，比如13寸的macbook,设置到全屏幕
  if (dimension.width <= mainWindowSize.Width) {
    mainWindowSize.width = dimension.width;
  }
  if (dimension.height <= mainWindowSize.height) {
    mainWindowSize.height = dimension.height;
  }
  log.info("screen size:", dimension, "use size:", mainWindowSize);
}

function installIPCHandle() {
  // 新建登录窗口，方便使用不同的账户测试
  ipcMain.on("new-login-window", () => {
    log.info("new-login-window");
    createWindow();
  });

  // 登录成功修改窗口大小
  ipcMain.on("after-login", (event) => {
    log.info("login");
    const mWindow = BrowserWindow.fromWebContents(event.sender);
    mWindow.setSize(mainWindowSize.width, mainWindowSize.height);
    mWindow.center();
  });

  // 登出恢复登录窗口大小
  ipcMain.on("after-logout", (event) => {
    log.info("logout");
    const mWindow = BrowserWindow.fromWebContents(event.sender);
    mWindow.setSize(loginWindowSize.width, loginWindowSize.height);
    mWindow.center();
    destroyBrowserView(mWindow);
  });
  // 获取应用信息
  ipcMain.handle("get-app-info", () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      isDev,
    };
  });
  // 切换主题
  ipcMain.handle("toggle-dark-mode", () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = "light";
    } else {
      nativeTheme.themeSource = "dark";
    }
    return nativeTheme.shouldUseDarkColors;
  });
  //打开开发者工具
  ipcMain.on("open-dev-tools", (event) => {
    event.sender.openDevTools();
  });

  ipcMain.handle("open-local-file", (event, filename, filepath) => {
    if (!filename) {
      return Promise.reject(new Error("filename is empty"));
    }

    const docDir = app.getPath("documents");
    const filePath = filepath ?? path.join(docDir, filename);
    let sfile =
      filepath ?? `${path.join(__dirname, `../dist-vite/static/${filename}`)}`;

    const openExt = (filename, parent) => {
      if (filename.endsWith(".jm")) {
        return shell.openPath(parent);
      } else {
        return shell.openPath(filename).catch((err) => {
          shell.openPath(parent);
          throw err;
        });
      }
    };

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filePath)) {
        fs.readFile(sfile, (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          fs.writeFile(filePath, data, (err) => {
            if (err) {
              reject(err);
              return;
            }
            openExt(filePath, docDir).then(resolve).catch(reject);
          });
        });
      } else {
        openExt(filePath, docDir).then(resolve).catch(reject);
      }
    });
  });

  ipcMain.handle("print-to-pdf", (event, filename) => {
    var options = {
      marginsType: 0,
      pageSize: "A4",
      printBackground: false,
      printSelectionOnly: false,
      landscape: false,
    };

    const mWindow = BrowserWindow.fromWebContents(event.sender);
    let docDir = app.getPath("documents");
    let savePath = path.join(docDir, `${filename}.pdf`);
    return new Promise((resolve, reject) => {
      mWindow.webContents
        .printToPDF(options)
        .then((data) => {
          dialog
            .showSaveDialog(mWindow, {
              title: `下载${filename}.pdf`,
              defaultPath: savePath,
            })
            .then((result) => {
              if (result.canceled) {
                resolve(result);
                return;
              }
              let filename = result.filePath;
              fs.writeFile(filename, data, (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  });

  ipcMain.handle("get-file-data", (event) => {
    var options = {
      marginsType: 0,
      pageSize: "A4",
      printBackground: false,
      printSelectionOnly: false,
      landscape: false,
    };

    const mWindow = BrowserWindow.fromWebContents(event.sender);
    return new Promise((resolve, reject) => {
      mWindow.webContents
        .printToPDF(options)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app
  .whenReady()
  .then(calculateSize)
  .then(createWindow)
  .then(initTab)
  .then(installIPCHandle)
  .then(startUpdater);

// 注册协议 https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
// 测试版和开发版使用不同的协议
const defaultProtocol = appId;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(defaultProtocol, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(defaultProtocol);
}
// 注册协议的open-url事件
// windows需要不同的处理方式，需要在second-instance事件中处理
let deeplinkingURL = null;
app.on("open-url", function (event, url) {
  event.preventDefault();
  if (!mainWindow) {
    deeplinkingURL = url;
    createWindow();
  } else {
    mainWindow.webContents.send("scheme-change", url);
  }
});

app.on("activate", function () {
  // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
  // 打开的窗口，那么程序会重新创建一个窗口。
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
app.on("second-instance", (event, argv) => {
  if (mainWindow) {
    if (process.platform == "win32") {
      const url = argv[argv.length - 1];
      if (url.startsWith(defaultProtocol)) {
        mainWindow.webContents.send("scheme-change", url);
      }
    }
    // Focus on the main window if the user tried to open another
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on("window-all-closed", function () {
  mainWindow = null;
  if (process.platform !== "darwin") app.quit();
});

// New window example arg: new windows url
ipcMain.handle("open-win", () => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      // eslint-disable-next-line no-undef
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  childWindow.loadURL(mainURL);
});
app.disableHardwareAcceleration(); //程序 ready 前禁用GPU加速
