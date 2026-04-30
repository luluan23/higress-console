<template>
  <div class="ai-page">
    <div class="ai-page__header">
      <h2 class="ai-page__title">AI 模型</h2>
      <t-button theme="primary" @click="openCreate">添加模型</t-button>
    </div>

    <!-- Filters -->
    <div class="ai-page__filters">
      <t-input
        v-model="search"
        placeholder="搜索 Provider 名称"
        clearable
        style="width: 240px"
      />
      <t-select
        v-model="filterProtocol"
        placeholder="协议"
        clearable
        style="width: 140px"
      >
        <t-option value="openai" label="OpenAI" />
        <t-option value="azure" label="Azure" />
        <t-option value="qwen" label="Qwen" />
        <t-option value="gemini" label="Gemini" />
        <t-option value="claude" label="Claude" />
      </t-select>
      <t-select
        v-model="filterStatus"
        placeholder="状态"
        clearable
        style="width: 140px"
      >
        <t-option value="healthy" label="正常" />
        <t-option value="throttling" label="限流中" />
        <t-option value="unavailable" label="不可用" />
      </t-select>
    </div>

    <!-- Table -->
    <t-table
      :data="filteredProviders"
      :columns="columns"
      row-key="name"
      :loading="aiStore.loadingProviders"
      stripe
      hover
    >
      <template #name="{ row }">
        <div class="provider-name-cell">
          <span class="provider-logo" :style="{ background: logoColor(row.type) }">
            {{ (row.type || row.name || '?')[0].toUpperCase() }}
          </span>
          <div>
            <div class="provider-name-cell__primary">{{ row.name }}</div>
            <div class="provider-name-cell__sub">{{ row.type || '' }}</div>
          </div>
        </div>
      </template>
      <template #tokenLabel="{ row }">
        <t-tag :theme="tokenTagTheme(row)" variant="light">{{ tokenLabel(row) }}</t-tag>
      </template>
      <template #failoverEnabled="{ row }">
        <t-tag :theme="row.failoverConfig?.enabled ? 'success' : 'default'" variant="light">
          {{ row.failoverConfig?.enabled ? '已启用' : '关闭' }}
        </t-tag>
      </template>
      <template #healthStatus="{ row }">
        <t-tag :theme="healthTheme(row.healthStatus)" variant="light">
          {{ healthLabel(row.healthStatus) }}
        </t-tag>
      </template>
      <template #op="{ row }">
        <t-space>
          <t-button variant="text" size="small" @click="openEdit(row)">编辑</t-button>
          <t-button variant="text" size="small" theme="danger" @click="confirmDelete(row)">删除</t-button>
        </t-space>
      </template>
    </t-table>

    <!-- Drawer -->
    <ProviderDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :initial-data="drawerData"
      @saved="onSaved"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useAiStore } from '@/stores/modules/aiStore'
import { DialogPlugin } from 'tdesign-vue-next'
import ProviderDrawer from './ProviderDrawer.vue'

export default {
  name: 'ProviderPage',
  components: { ProviderDrawer },
  data() {
    return {
      search: '',
      filterProtocol: '',
      filterStatus: '',
      drawerVisible: false,
      drawerMode: 'create',
      drawerData: null,
      columns: [
        { colKey: 'name', title: 'Provider 名称', cell: 'name' },
        { colKey: 'protocol', title: '协议' },
        { colKey: 'tokenLabel', title: 'Token 数量', cell: 'tokenLabel' },
        { colKey: 'failoverEnabled', title: 'Failover 状态', cell: 'failoverEnabled' },
        { colKey: 'healthStatus', title: '健康状态', cell: 'healthStatus' },
        { colKey: 'op', title: '操作', cell: 'op', width: 140 },
      ],
    }
  },
  computed: {
    aiStore() {
      return useAiStore()
    },
    filteredProviders() {
      return this.aiStore.providers.filter((p) => {
        const matchSearch = !this.search || p.name?.includes(this.search)
        const matchProtocol = !this.filterProtocol || p.protocol === this.filterProtocol
        const matchStatus = !this.filterStatus || p.healthStatus === this.filterStatus
        return matchSearch && matchProtocol && matchStatus
      })
    },
  },
  created() {
    this.aiStore.fetchProviders()
  },
  methods: {
    logoColor(type) {
      const colors = {
        openai: '#10a37f', azure: '#0078d4', qwen: '#ff6a00',
        gemini: '#1a73e8', claude: '#d97706',
      }
      return colors[type] || '#6366f1'
    },
    tokenLabel(row) {
      const tokens = row.tokens || row.tokenList || []
      if (tokens.length <= 1) return '单 Token'
      return row.failoverConfig?.enabled ? 'Failover 备份' : '轮询负载均衡'
    },
    tokenTagTheme(row) {
      const tokens = row.tokens || row.tokenList || []
      if (tokens.length <= 1) return 'default'
      return row.failoverConfig?.enabled ? 'warning' : 'primary'
    },
    healthTheme(status) {
      const map = { healthy: 'success', throttling: 'warning', unavailable: 'danger' }
      return map[status] || 'default'
    },
    healthLabel(status) {
      const map = { healthy: '正常', throttling: '限流中', unavailable: '不可用' }
      return map[status] || '正常'
    },
    openCreate() {
      this.drawerMode = 'create'
      this.drawerData = null
      this.drawerVisible = true
    },
    openEdit(row) {
      this.drawerMode = 'edit'
      this.drawerData = { ...row }
      this.drawerVisible = true
    },
    confirmDelete(row) {
      const dialog = DialogPlugin.confirm({
        header: '确认删除',
        body: `确认删除 Provider「${row.name}」？`,
        confirmBtn: { content: '确认删除', theme: 'danger' },
        onConfirm: async () => {
          await this.aiStore.deleteProvider(row.name)
          dialog.hide()
        },
        onClose: () => dialog.hide(),
      })
    },
    onSaved() {
      this.drawerVisible = false
      this.aiStore.fetchProviders()
    },
  },
}
</script>

<style lang="scss" scoped>
.ai-page {
  padding: 24px;
  background: var(--bg-0, #f5f6fa);
  min-height: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary, #1a1f2e);
    margin: 0;
  }

  &__filters {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}

.provider-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  &__primary {
    font-weight: 600;
    color: var(--text-primary, #1a1f2e);
    font-size: 13px;
  }

  &__sub {
    font-size: 11px;
    color: var(--text-muted, #8896a9);
  }
}

.provider-logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
</style>
