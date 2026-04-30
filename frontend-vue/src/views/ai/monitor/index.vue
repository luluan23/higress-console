<template>
  <div class="monitor-page">
    <!-- Loading state -->
    <div v-if="loading" class="monitor-page__loading">
      <t-loading size="large" text="加载中..." />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="monitor-page__empty">
      <t-result theme="error" title="加载失败" :description="error">
        <template #extra>
          <t-button theme="primary" @click="init">重试</t-button>
        </template>
      </t-result>
    </div>

    <!-- Configured state: show iframe -->
    <div v-else-if="dashboardUrl" class="monitor-page__iframe-wrap">
      <div class="monitor-page__topbar">
        <span class="monitor-page__topbar-title">AI 监控看板</span>
        <t-button variant="outline" size="small" @click="openNewTab">在新标签页打开</t-button>
      </div>
      <div class="monitor-page__frame-container">
        <t-loading v-if="iframeLoading" size="large" text="加载看板..." class="monitor-page__overlay" />
        <div v-if="iframeError" class="monitor-page__frame-error">
          <t-result theme="error" title="看板加载失败" description="连接超时或内容无法显示">
            <template #extra>
              <t-button theme="primary" @click="reloadIframe">重试</t-button>
            </template>
          </t-result>
        </div>
        <iframe
          v-else
          ref="iframeEl"
          :src="dashboardUrl"
          class="monitor-page__iframe"
          frameborder="0"
          @load="onIframeLoad"
          @error="onIframeError"
        ></iframe>
      </div>
    </div>

    <!-- Unconfigured state -->
    <div v-else class="monitor-page__empty">
      <t-result
        theme="default"
        title="Grafana 监控看板尚未初始化"
        description="点击下方按钮初始化 Grafana 监控看板"
      >
        <template #extra>
          <t-button theme="primary" :loading="initializing" @click="initDashboard">
            初始化看板
          </t-button>
        </template>
      </t-result>
    </div>
  </div>
</template>

<script>
import { getDashboardInfo, initDashboard } from '@/api/aiApi'

export default {
  name: 'MonitorPage',
  data() {
    return {
      loading: true,
      error: '',
      dashboardUrl: '',
      iframeLoading: false,
      iframeError: false,
      iframeTimeoutId: null,
      initializing: false,
    }
  },
  mounted() {
    this.init()
  },
  beforeUnmount() {
    clearTimeout(this.iframeTimeoutId)
  },
  methods: {
    async init() {
      this.loading = true
      this.error = ''
      try {
        const res = await getDashboardInfo('AI')
        const url = res?.data?.url || res?.url || ''
        this.dashboardUrl = url
        if (url) {
          this.iframeLoading = true
          this.iframeError = false
          this.startIframeTimeout()
        }
      } catch (e) {
        this.error = e?.message || '获取看板信息失败'
      } finally {
        this.loading = false
      }
    },
    async initDashboard() {
      this.initializing = true
      try {
        await initDashboard()
        await this.init()
      } catch (e) {
        this.error = e?.message || '初始化失败'
      } finally {
        this.initializing = false
      }
    },
    onIframeLoad() {
      clearTimeout(this.iframeTimeoutId)
      this.iframeLoading = false
      this.iframeError = false
    },
    onIframeError() {
      clearTimeout(this.iframeTimeoutId)
      this.iframeLoading = false
      this.iframeError = true
    },
    startIframeTimeout() {
      clearTimeout(this.iframeTimeoutId)
      this.iframeTimeoutId = setTimeout(() => {
        if (this.iframeLoading) {
          this.iframeLoading = false
          this.iframeError = true
        }
      }, 10000)
    },
    reloadIframe() {
      this.iframeError = false
      this.iframeLoading = true
      this.startIframeTimeout()
      // Re-assign src to force reload
      if (this.$refs.iframeEl) {
        const src = this.dashboardUrl
        this.$refs.iframeEl.src = ''
        this.$nextTick(() => {
          this.$refs.iframeEl.src = src
        })
      }
    },
    openNewTab() {
      window.open(this.dashboardUrl, '_blank', 'noopener,noreferrer')
    },
  },
}
</script>

<style lang="scss" scoped>
.monitor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-0, #f5f6fa);

  &__loading,
  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--topbar-bg, #ffffff);
    border-bottom: 1px solid var(--bg-border, #dde1ea);

    &-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #1a1f2e);
    }
  }

  &__iframe-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__frame-container {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  &__iframe {
    width: 100%;
    height: calc(100vh - 56px);
    border: none;
    display: block;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-0, #f5f6fa);
    z-index: 1;
  }

  &__frame-error {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-0, #f5f6fa);
    z-index: 1;
  }
}
</style>
