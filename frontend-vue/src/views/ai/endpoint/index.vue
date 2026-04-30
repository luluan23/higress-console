<template>
  <div class="endpoint-page">
    <div class="endpoint-page__header">
      <h2 class="endpoint-page__title">API 端点</h2>
    </div>

    <!-- API address card -->
    <div class="info-card">
      <div class="info-card__label">API 地址</div>
      <div class="info-card__value">
        <CopyText :text="apiEndpoint" monospace />
      </div>
    </div>

    <!-- Auth description -->
    <div class="section">
      <div class="section__title">认证方式</div>
      <div class="auth-list">
        <div class="auth-item">
          <t-tag theme="primary" variant="light">Bearer Token</t-tag>
          <span class="auth-item__desc">在请求头中添加 <code>Authorization: Bearer &lt;your-key&gt;</code></span>
        </div>
        <div class="auth-item">
          <t-tag theme="default" variant="light">key-auth</t-tag>
          <span class="auth-item__desc">在请求头中添加 <code>X-API-Key: &lt;your-key&gt;</code></span>
        </div>
      </div>
    </div>

    <!-- curl example -->
    <div class="section">
      <div class="section__title">
        curl 示例
        <t-button variant="text" size="small" @click="copyCurl">复制</t-button>
      </div>
      <pre class="code-block">{{ curlExample }}</pre>
    </div>

    <!-- Provider list -->
    <div class="section">
      <div class="section__title">支持的模型 ({{ aiStore.providers.length }})</div>
      <t-loading v-if="aiStore.loadingProviders" />
      <t-table
        v-else
        :data="aiStore.providers"
        :columns="providerColumns"
        row-key="name"
        size="small"
        stripe
      />
    </div>
  </div>
</template>

<script>
import { useAiStore } from '@/stores/modules/aiStore'
import { MessagePlugin } from 'tdesign-vue-next'
import CopyText from '@/components/common/CopyText.vue'

export default {
  name: 'EndpointPage',
  components: { CopyText },
  computed: {
    aiStore() { return useAiStore() },
    apiEndpoint() {
      const firstRoute = this.aiStore.routes[0]
      const domain = firstRoute?.domains?.[0] || 'your-gateway.example.com'
      return `https://${domain}/v1/chat/completions`
    },
    curlExample() {
      return `curl ${this.apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`
    },
    providerColumns() {
      return [
        { colKey: 'name', title: 'Provider 名称' },
        { colKey: 'type', title: '类型' },
        { colKey: 'protocol', title: '协议' },
      ]
    },
  },
  created() {
    this.aiStore.fetchProviders()
    this.aiStore.fetchRoutes()
  },
  methods: {
    async copyCurl() {
      try {
        await navigator.clipboard.writeText(this.curlExample)
        MessagePlugin.success('已复制')
      } catch {
        MessagePlugin.error('复制失败')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.endpoint-page {
  padding: 24px;
  background: var(--bg-0, #f5f6fa);
  min-height: 100%;

  &__header {
    margin-bottom: 20px;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary, #1a1f2e);
    margin: 0;
  }
}

.info-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--bg-border, #dde1ea);
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 20px;

  &__label {
    font-size: 12px;
    color: var(--text-muted, #8896a9);
    margin-bottom: 8px;
    font-weight: 500;
  }

  &__value {
    font-size: 18px;
  }
}

.section {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--bg-border, #dde1ea);
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1a1f2e);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.auth-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.auth-item {
  display: flex;
  align-items: center;
  gap: 10px;

  &__desc {
    font-size: 13px;
    color: var(--text-secondary, #4a5568);
  }

  code {
    font-family: monospace;
    background: var(--bg-2, #eef0f6);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12px;
  }
}

.code-block {
  background: var(--bg-2, #eef0f6);
  border: 1px solid var(--bg-border, #dde1ea);
  border-radius: 6px;
  padding: 14px 16px;
  font-family: monospace;
  font-size: 12px;
  color: var(--text-primary, #1a1f2e);
  overflow-x: auto;
  white-space: pre;
  line-height: 1.6;
  margin: 0;
}
</style>
