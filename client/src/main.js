import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "material-design-icons-iconfont/dist/material-design-icons.css";

import VueSocketIO from "vue-socket.io";
import SocketIO from "socket.io-client";

Vue.use(
    new VueSocketIO({
        debug: true,
        connection: SocketIO("http://localhost:3000"),
    })
);

Vue.config.productionTip = false;
Vue.use(vuetify);
new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
}).$mount("#app");
