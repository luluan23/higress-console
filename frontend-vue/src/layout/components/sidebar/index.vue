<template>
  <div class="ai-sidebar">
    <!-- Logo area -->
    <div class="ai-sidebar__logo">
      <span class="ai-sidebar__logo-icon">✦</span>
      <span class="ai-sidebar__logo-text">LLM Platform</span>
    </div>

    <!-- 我的 section (all roles) -->
    <div class="ai-sidebar__section">
      <div class="ai-sidebar__section-title">我的</div>
      <nav class="ai-sidebar__nav">
        <router-link
          v-for="item in myLinks"
          :key="item.path"
          :to="item.path"
          class="ai-sidebar__nav-item"
          :class="{ 'is-active': isActive(item.path) }"
        >
          <span class="ai-sidebar__nav-icon">{{ item.icon }}</span>
          <span class="ai-sidebar__nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
    </div>

    <!-- 管理 section (admin only) -->
    <div v-if="appStore.userRole === 'admin'" class="ai-sidebar__section">
      <div class="ai-sidebar__section-title">管理</div>
      <nav class="ai-sidebar__nav">
        <router-link
          v-for="item in adminLinks"
          :key="item.path"
          :to="item.path"
          class="ai-sidebar__nav-item"
          :class="{ 'is-active': isActive(item.path) }"
        >
          <span class="ai-sidebar__nav-icon">{{ item.icon }}</span>
          <span class="ai-sidebar__nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Theme toggle at sidebar bottom -->
    <div class="ai-sidebar__footer">
      <div class="ai-sidebar__theme-toggle">
        <button
          v-for="opt in themeOptions"
          :key="opt.value"
          class="ai-sidebar__theme-btn"
          :class="{ 'is-active': themeStore.theme === opt.value }"
          :title="opt.label"
          @click="themeStore.setTheme(opt.value)"
        >
          <span>{{ opt.icon }}</span>
        </button>
      </div>
      <span class="ai-sidebar__theme-label">{{ currentThemeLabel }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useAppStore } from '@/stores'
import { useThemeStore } from '@/stores/modules/themeStore'

export default {
  name: 'AiSidebar',
  computed: {
    ...mapState(useAppStore, ['sidebar']),
    appStore() {
      return useAppStore()
    },
    themeStore() {
      return useThemeStore()
    },
    themeOptions() {
      return [
        { value: 'system', icon: '⊙', label: '跟随系统' },
        { value: 'light', icon: '☀', label: '浅色' },
        { value: 'dark', icon: '🌙', label: '深色' },
      ]
    },
    currentThemeLabel() {
      const map = { system: '跟随系统', light: '浅色', dark: '深色' }
      return map[this.themeStore.theme] || '跟随系统'
    },
    myLinks() {
      return [
        { path: '/ai/dashboard', label: '仪表盘', icon: '▦' },
        { path: '/ai/endpoint', label: 'API 端点', icon: '⇌' },
        { path: '/ai/usage', label: '用量明细', icon: '≋' },
      ]
    },
    adminLinks() {
      return [
        { path: '/ai/provider', label: 'AI 模型', icon: '◈' },
        { path: '/ai/route', label: 'AI 路由', icon: '⇢' },
        { path: '/ai/consumer', label: '消费者 KEY', icon: '⚿' },
        { path: '/ai/overview', label: '系统概览', icon: '◉' },
        { path: '/ai/monitor', label: '监控看板', icon: '⊞' },
      ]
    },
  },
  methods: {
    isActive(path) {
      return this.$route.path === path || this.$route.path.startsWith(path + '/')
    },
  },
}
</script>
<style lang="scss" scoped>
.ai-sidebar {
  width: 200px;
  height: 100vh;
  background: var(--sidebar-bg, #ffffff);
  border-right: 1px solid var(--bg-border, #dde1ea);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;

  &__logo {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 20px 16px 16px;
    border-bottom: 1px solid var(--bg-border, #dde1ea);
  }

  &__logo-icon {
    font-size: 20px;
    color: var(--color-blue, #0052d9);
  }

  &__logo-text {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary, #1a1f2e);
    letter-spacing: 0.5px;
  }

  &__section {
    padding: 12px 0 4px;
  }

  &__section-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted, #8896a9);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 0 16px 6px;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 8px;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    text-decoration: none;
    color: var(--text-secondary, #4a5568);
    font-size: 13px;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--bg-2, #eef0f6);
      color: var(--text-primary, #1a1f2e);
    }

    &.is-active {
      background: var(--sidebar-active-bg, #edf3fe);
      color: var(--sidebar-active-text, #0052d9);
      font-weight: 600;
    }
  }

  &__nav-icon {
    font-size: 14px;
    width: 18px;
    text-align: center;
    flex-shrink: 0;
  }

  &__footer {
    margin-top: auto;
    padding: 12px 12px 16px;
    border-top: 1px solid var(--bg-border, #dde1ea);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  &__theme-toggle {
    display: flex;
    gap: 4px;
    background: var(--bg-2, #eef0f6);
    border-radius: 8px;
    padding: 3px;
    width: 100%;
  }

  &__theme-btn {
    flex: 1;
    border: none;
    background: transparent;
    border-radius: 6px;
    padding: 5px 0;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-muted, #8896a9);
    transition: background 0.15s, color 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: var(--bg-1, #ffffff);
      color: var(--text-secondary, #4a5568);
    }

    &.is-active {
      background: var(--bg-1, #ffffff);
      color: var(--sidebar-active-text, #0052d9);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }

  &__theme-label {
    font-size: 11px;
    color: var(--text-muted, #8896a9);
  }
}
</style>
