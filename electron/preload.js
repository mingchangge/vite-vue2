import { contextBridge, ipcRenderer } from 'electron'
import { appendLoading, removeLoading } from './spinner'

contextBridge.exposeInMainWorld('electronAPI', {
  AfterLogin: () => ipcRenderer.send('after-login'),
  AfterLogout: () => ipcRenderer.send('after-logout'),
  NewLoginWindow: () => ipcRenderer.send('new-login-window'),
  AppInfo: () => ipcRenderer.invoke('get-app-info'),
  ToggleTheme: () => ipcRenderer.invoke('toggle-dark-mode'),
  OpenLocalFile: (filename, filePath) =>
    ipcRenderer.invoke('open-local-file', filename, filePath),
  ToggleDevTools: () => ipcRenderer.send('toggle-dev-tools'),
  OpenDevTools: () => ipcRenderer.send('open-dev-tools'),
  onSchemeChange: callback => ipcRenderer.on('scheme-change', callback),
  PrintToPdf: filename => ipcRenderer.invoke('print-to-pdf', filename),
  GetFileData: filename => ipcRenderer.invoke('get-file-data', filename),
  sendChangeBrowserView: (msg, options) => ipcRenderer.send(msg, options),
  MinimizeWindow: () => ipcRenderer.send('minimize-window'),
  MaximizeWindow: () => ipcRenderer.send('maximize-window'),
  CloseWindow: () => ipcRenderer.send('close-window')
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
function domReady(condition = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}
domReady().then(() => {
  appendLoading()
})
window.addEventListener('load', () => {
  removeLoading()
})
