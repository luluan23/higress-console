import { defineStore } from 'pinia'
import {constantRoutes }  from "../../router";
import { getUserInfo, getProviders } from '../../api/aiApi';
export const useAppStore = defineStore('appStore', {
  state:() => ({
    sidebar: {
      opened: true,
      withoutAnimation: false,
    },
    openMenuIndex: [], // 默认打开的菜单
    permissionRoutes:constantRoutes,
    pageState: null,
    userRole: 'user', // 'user' | 'admin'
  }),
  getter: {

  },
  actions:{
    moduleToggleSideBar(){
      this.sidebar.opened = !this.sidebar.opened;
      this.sidebar.withoutAnimation = false;
    },
    setUserRole(role) {
      this.userRole = role
    },
    async resolveUserRole() {
      try {
        const res = await getUserInfo()
        const role = res?.data?.role || res?.role
        if (role) {
          this.userRole = role === 'admin' ? 'admin' : 'user'
          return
        }
      } catch (e) {
        // /user/info not available or 403, fall through to provider check
      }
      // Fallback: test /v1/ai/providers
      try {
        await getProviders()
        this.userRole = 'admin'
      } catch (e) {
        this.userRole = 'user'
      }
    },
  }
})
