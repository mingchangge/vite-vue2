import { ipcRenderer } from 'electron'
const safeDOM = {
  append(parent, child) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent, child) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  }
}
/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(22,93,255,0.3);
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      if (!document.body) {
        let oBody = document.createElement('body')
        document.documentElement.appendChild(oBody)
      }
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    }
  }
}
function useErrorPage(params) {
  const { errorCode, errorDescription, validatedURL } = params
  const oDiv = document.createElement('div')
  const styleContent = `.app-error-content{
    margin: 40px;
  }`
  const oStyle = document.createElement('style')
  oStyle.innerHTML = styleContent
  oDiv.innerHTML = `
    <div class="app-error-content">
      <h1>页面加载出错</h1>
      <p>错误码：${errorCode}</p>
      <p>错误代号：${errorDescription}</p>
      <p>错误地址：${validatedURL}</p>
    </div>
  `
  safeDOM.append(document.head, oStyle)
  safeDOM.append(document.body, oDiv)
}

ipcRenderer.on('loading-show', () => {
  console.log('loading-show')
  appendLoading()
})
ipcRenderer.on('loading-hide', () => {
  console.log('loading-hide')
  removeLoading()
})

ipcRenderer.on('fail-load', (event, params) => {
  removeLoading()
  console.log('fail-load')
  console.log(event)
  console.log(JSON.parse(params))
  let parameters = JSON.parse(params) || {}
  useErrorPage(parameters)
})

const { appendLoading, removeLoading } = useLoading()

export { appendLoading, removeLoading }
