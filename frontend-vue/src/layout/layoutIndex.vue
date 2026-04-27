<template>
    <div>
        <div v-if="'vertical' === layoutMode">
            <!--左右布局-->
            <div :class="classObj" class="app-wrapper">
                <Sidebar class="sidebar-container" />
                <div class="main-container">
                    <div>
                        <!-- 根据环境变量决定是否显示导航栏 -->
                        <nav-bar v-if="showNavBar" />
                    </div>
                    <app-main />
                </div>
            </div>
        </div>
        <div v-else-if="'horizontal' === layoutMode">
            <div  class="app-wrapper">
                <div>
                    <!-- 根据环境变量决定是否显示导航栏 -->
                    <nav-bar v-if="showNavBar" />
                </div>
                <app-main />
            </div>
        </div>
        <div v-else>
            <!-- 根据环境变量决定是否显示导航栏 -->
            <nav-bar v-if="showNavBar" />
            <app-main />
        </div>
    </div>
</template>
<script>
  import { mapState, mapActions } from 'pinia'
  import { useAppStore, useTechStore, useDataStore } from '@/stores'
  import settings from "./../settings";
  import { NavBar, AppMain, Sidebar } from "./components";
  import { useRouter } from 'vue-router'
  export default {
    name: "Layout",
    data() {
      return {
        layoutMode: "",
        // 新增变量控制导航栏显示
        showNavBar: false,
        router: useRouter(),
      };
    },
    components: {
      NavBar,
      AppMain,
      Sidebar
    },
    computed: {
      ...mapState(useAppStore, ['sidebar']),
      classObj() {
        return {
          hideSidebar: !this.sidebar.opened,
          openSidebar: this.sidebar.opened,
          withoutAnimation: this.sidebar.withoutAnimation
        };
      },
    },
    methods: {
      // ...mapActions(useDataStore, ['moduleGetUserPermission']),
      ...mapActions(useTechStore, ['moduleGetUserPermission']),
      async getUserPermission() {
        try {
          const res = await this.moduleGetUserPermission()
          let authObj = {appId: -1}
          let pList = []
          res.string.forEach((v) => {
            pList.push(this.handlerPermisssionString(v))
          })
          authObj.privileges = pList
          const techStore = useTechStore() 
          techStore.techAuthoritylist = [(authObj)]
          // console.log("techStore.techAuthoritylist", techStore.techAuthoritylist)
          this.router.push({name: 'mainpage'})
        } catch (error) {
          console.error(error)
        }
      },
      handlerPermisssionString(pString) {
        let [s1, ...rest] = pString.split(':')
        let s2 = rest.join(':')
        return {sysCode: s1, resCode: s2}
      }
    },
    created() {
      /**
       * 子应用之间的布局模式
       * 1. 如果是微应用,默认用有侧边栏模式,如果主应用参数为无侧边栏模式,则子应用也为无侧边栏模式
      **/
     //默认
     let layoutMode = null;
     const microAppData = window.microApp?.getData();
      // 非微应用环境,直接使用layout
      if ( !window.__MICRO_APP_ENVIRONMENT__ ) {
        layoutMode = settings.layoutMode;
      } else {
        // 主应用控制侧边栏支持
        //判断非空
        if (microAppData && 'layoutMode' in microAppData) {
          //标准模式显示子应用侧边栏,opsany布局样式
          if (microAppData.layoutMode === "standard"){
            layoutMode = settings.layoutMode;
          } else if (microAppData.layoutMode === "tc"){
            layoutMode = null;
          }
        }
      }
      this.layoutMode = layoutMode;
      // 读取环境变量并赋值给 showNavBar
      //microAppData.hideNavBar 为 true 时，不显示导航栏
      if (microAppData && 'hideNavBar' in microAppData) {
        this.showNavBar = microAppData.hideNavBar !== true; 
      }
    },
    beforeMount() {
      // console.log('layout mounted')
      // this.getUserPermission()
      // this.moduleGetUserPermission()
    }
  };
</script>

<style lang="scss" scoped>
    .app-wrapper {
        @include clearfix;
        position: relative;
        height: 100%;
        width: 100%;
    }

    .drawer-bg {
        background: #000;
        opacity: 0.3;
        width: 100%;
        top: 0;
        height: 100%;
        position: absolute;
        z-index: 999;
    }

    .fixed-header {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 9;
        width: calc(100% - #{$sideBarWidth});
        transition: width 0.28s;
    }

    .hideSidebar .fixed-header {
        width: calc(100% - 54px);
    }

</style>
