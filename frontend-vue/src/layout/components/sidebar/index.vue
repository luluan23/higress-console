<template>
    <div  :class="{ 'has-logo': true,'mcromenuwarp':true }">
        <logo :collapse="isCollapse" />
        <el-scrollbar >
            <el-menu
                    :default-active="activeMenu"
                    :collapse="isCollapse"
                    :unique-opened="false"
                    :default-openeds="openmenu"
                    :collapse-transition="false"
                    mode="vertical"
            >
                <sidebar-item
                        v-for="route in permissionRoutes"
                        :key="route.path"
                        :item="route"
                        :base-path="route.path"
                />
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<script>
  import { mapState } from 'pinia'
  import { useAppStore } from '@/stores'
  import Logo from "./logo.vue" ;
  import SidebarItem from "./sidebarItem.vue";

  export default {
    data() {
      return {
        openmenu: [],
      };
    },
    components: { SidebarItem, Logo },
    computed: {
      ...mapState(useAppStore, ['sidebar', 'permissionRoutes','openMenuIndex']),
      activeMenu() {
        const route = this.$route;
        const { meta, path } = route;
        // if set path, the sidebar will highlight the path you set
        if (meta.activeMenu) {
          return meta.activeMenu;
        }
        return path;
      },
      isCollapse() {
        return !this.sidebar.opened;
      },
    },
    watch: {
      openMenuIndex() {
        this.openmenu = [];
        this.openmenu.push(...this.openMenuIndex);
      },
      permission_routes: {
        handler: function (newdata, olddata) {
          
        },
        immediate: true,
      },
    },
    methods: {

    },
  };
</script>
<style lang="scss" scoped>
    @import '../../../styles/variables.scss';
    .mcromenuwarp :deep(.el-menu-item) {
        height: 36px ;
        line-height: 36px ;
        position: relative;
        -webkit-box-sizing: border-box;
        white-space: nowrap;
        list-style: none;
        font-size: 12px;
        font-weight: 500;
        color: $fontColor2;
        padding:0;
        span{
            position: relative;
            margin-top: 2px;
        }
    }

    .mcromenuwarp :deep(.closeSidebar) .el-submenu > .el-submenu__title .svg-icon {
        margin-left: 20px;
    }

    .mcromenuwarp :deep(.sidebar-container)  > .el-sub-menu__title .svg-icon {
        margin-left: 20px;
    }

    .mcromenuwarp :deep(.el-sub-menu__title) {
        height: 36px;
        line-height: 36px;
        position: relative;
        -webkit-box-sizing: border-box;
        white-space: nowrap;
        list-style: none;
        font-size: 12px;
        font-weight: 500;
        color: $fontColor2;
    }

    .mcromenuwarp :deep(.el-menu-item.is-active) {
        background:#cde6ff !important;

    }
    .mcromenuwarp :deep(.el-menu-item.is-active:before) {
        content: '';
        border-left: 3px solid $fontColor1;
        position: absolute;
        left: 0;
        height: 38px;
        width: 16px;
    }
</style>
