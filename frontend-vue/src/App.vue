<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { useThemeStore } from '@/stores/modules/themeStore'
import { useAppStore } from '@/stores/modules/appStore'

export default {
  name: 'App',
  created() {
    const themeStore = useThemeStore()
    themeStore.initTheme()
    const appStore = useAppStore()
    appStore.resolveUserRole()
  },
}
</script>

<style lang="scss">
  *::-webkit-scrollbar {
    width: 6px;
    height: 10px;
    background-color: transparent;
  } /*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
  *::-webkit-scrollbar-track {
    background-color: #f0f6ff;
  } /*定义滚动条轨道 内阴影+圆角*/
  *::-webkit-scrollbar-thumb {
    background-color: #b8becd;
    border-radius: 6px;
  } /*定义滑块 内阴影+圆角*/
  .scrollbarHide::-webkit-scrollbar {
    display: none;
  }
  .scrollbarShow::-webkit-scrollbar {
    display: block;
  }
</style>
