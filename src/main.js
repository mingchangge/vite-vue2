import Vue from "vue";
import App from "./App.vue";
import { store } from "./store";
import { router } from "./router";
import { setupGuard } from "./router/guard";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import * as eCharts from "echarts"; // 引入echarts
import G6 from "@antv/g6";

Vue.prototype.$eCharts = eCharts; // 挂载在Vue原型上
Vue.prototype.$G6 = G6; // 挂载在Vue原型上

setupGuard(router);

Vue.use(store);
Vue.use(ElementUI);

export default new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
