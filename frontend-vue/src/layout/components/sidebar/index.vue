<template>
  <div  :class="{ 'has-logo': true,'mcromenuwarp':true, 'ai-sidebar-shell': isAiConsoleLayout }">
        <logo :collapse="isCollapse" />
    <template v-if="isAiConsoleLayout">
      <nav class="ai-sidebar-nav">
        <div class="ai-sidebar-group-title">AI 管理</div>
        <router-link
          v-for="item in aiMenuItems"
          :key="item.path"
          :to="item.path"
          :class="['ai-sidebar-link', { 'is-active': activeMenu.startsWith(item.path) }]"
        >
          {{ item.title }}
        </router-link>
      </nav>
    </template>
    <el-scrollbar v-else>
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
  import { AI_MENU_ITEMS, isAiConsoleRoute } from './../../aiNavigation'

  export default {
    name: 'AppSidebar',
    data() {
      return {
        openmenu: [],
      };
    },
    components: { SidebarItem, Logo },
    computed: {
      ...mapState(useAppStore, ['sidebar', 'permissionRoutes','openMenuIndex']),
      aiMenuItems() {
        return AI_MENU_ITEMS;
      },
      isAiConsoleLayout() {
        return isAiConsoleRoute(this.$route);
      },
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

    .ai-sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 24px 16px;
    }

    .ai-sidebar-group-title {
      color: #94a3b8;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ai-sidebar-link {
      border-radius: 8px;
      color: #e2e8f0;
      padding: 12px 14px;
      transition: background 0.2s ease, color 0.2s ease;
    }

    .ai-sidebar-link.is-active {
      background: #1e40af;
      color: #ffffff;
    }
</style>
