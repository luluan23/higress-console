import { defineStore } from 'pinia'
import {constantRoutes }  from "../../router";
export const useAppStore = defineStore('appStore', {
  state:() => ({
    sidebar: {
      opened: true,
      withoutAnimation: false,
    },
    openMenuIndex: [], // 默认打开的菜单
    permissionRoutes:constantRoutes,
    pageState: null,
  }),
  getter: {

  },
  actions:{
    moduleToggleSideBar(){
      this.sidebar.opened = !this.sidebar.opened;
      this.sidebar.withoutAnimation = false;
    }

  }
})
