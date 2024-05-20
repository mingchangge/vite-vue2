import Vue from "vue";
import App from "./app.vue";
import { store } from "./store";
import { router } from "./router";
import { setupGuard } from "./router/guard";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

setupGuard(router);

Vue.use(store);
Vue.use(ElementUI);

export default new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
