import { createApp } from 'vue'
import router, { asyncRoutes, constantRoutes } from "./router";
import { setupPermission } from './permission' // permission control
import { setupStore } from './stores'
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import {install} from '@icon-park/vue-next/es/all';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import "./assets/icon/iconfont.css";
import Emitter from 'tiny-emitter'
// import moment from "moment";
// import {getBus} from '@/utils/bus.js'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import stateSave from "./directive/stateSave";
import authDirective from "./directive/authDirective";
// import buryingPoint from './directive/buryingPoint';
import microAppActions from "./utils/microAppState.js";
let app = null;
let routerForQiankun = null;
let history = null;
function bootstrapVue3(container) {
  setupPermission(router)
  // 进行创建，挂载app的一系列操作，这里挂载的时候可以利用传入的container
  app = createApp(App);
  const emitter = new Emitter()
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  setupStore(app)
  app.use(router)
  app.use(ElementPlus)
  app.use(stateSave);
  app.use(authDirective);
  // app.use(buryingPoint);
  // app.config.globalProperties.bus = getBus();
  // app.config.globalProperties.$moment = moment;
  install(app, 'tcicon')
  app.mount(container);
}


const initMicroApp = (container) => {
  history = createWebHashHistory(window.__MICRO_APP_BASE_ROUTE__ ? `OMSMain/#${window.__MICRO_APP_BASE_ROUTE__}` : '/')
  routerForQiankun = createRouter({
    // 运行在主应用中时，添加路由命名空间 /vue
    history,
    routes: [...asyncRoutes, ...constantRoutes],
  });
  setupPermission(routerForQiankun)
  app = createApp(App);
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  setupStore(app)
  app.use(routerForQiankun);
  app.use(ElementPlus)
  app.use(stateSave);
  app.use(authDirective);
  // app.use(buryingPoint);
  // app.config.globalProperties.bus = getBus();
  // app.config.globalProperties.$moment = moment;
  app.config.globalProperties.bus = Emitter;
  microAppActions.setActions(window.microApp)
  install(app, 'tcicon')
  app.mount(container);
}

window.unmount = () => {
  app.unmount();
  app = null;
}

window.__MICRO_APP_ENVIRONMENT__ ? initMicroApp('#app') : bootstrapVue3('#app');
