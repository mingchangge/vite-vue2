/**
 * https://juejin.cn/post/7182500241042571319(关于页面定时轮询导致的三个坑 )
 * https://juejin.cn/post/6979031900220293157
 *
 * https://juejin.cn/post/6899384588838109192（
 * 定时器setInterval(),setTimeout(),requestAnimationFrame()的原理区别）
 * https://juejin.cn/post/7217994625343848506（
 * JavaScript中计时器requestAnimationFrame、setTimeout、setInterval、setImmediate的使用和区别）
 * https://juejin.cn/post/7045113363625410590（
 * 「前端进阶」你不知道的 setTimeout、setInterval、requestAnimationFrame）
 * https://juejin.cn/post/6844903773622501383（
 * 深度解密setTimeout和setInterval——为setInterval正名！）
 * */

class MyInterval {
  constructor(fn) {
    this.fn = fn; // 定时器执行的函数--必须是一个返回Promise的函数
    this.timer = null; // 保存setTimeout的ID，用于取消
    this.stop = false; // 是否停止定时器
  }
  // 开始定时器
  start(delay = 60) {
    this.fn().then(() => {
      if (!this.stop) {
        this.timer = setTimeout(() => {
          this.start(delay * 1000);
        }, delay * 1000);
      }
    });
  }
  // 停止定时器
  stop() {
    this.stop = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  // 添加页面可见性监听
  addVisibilityListener() {
    if (!document) return;
    document.addEventListener(
      "visibilitychange",
      this.visibilityChange.bind(this)
    );
  }
  // 移除页面可见性监听
  removeVisibilityListener() {
    if (!document) return;
    document.removeEventListener(
      "visibilitychange",
      this.visibilityChange.bind(this)
    );
  }
  // 页面可见性变化时触发
  visibilityChange() {
    if (document.visibilityState === "hidden") {
      // 页面隐藏--停止定时器
      this.stop();
    } else {
      // 页面显示--重新启动定时器
      this.start();
    }
  }
}
