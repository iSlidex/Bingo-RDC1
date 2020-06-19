import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "material-design-icons-iconfont/dist/material-design-icons.css";

import VueSocketIOExt from "vue-socket.io-extended";
import io from "socket.io-client";

const port = process.env.VUE_APP_PORT || 3000;
const socket = io(`http://localhost:${port}`);

Vue.use(VueSocketIOExt, socket);

Vue.config.productionTip = false;
Vue.use(vuetify);

new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
}).$mount("#app");
