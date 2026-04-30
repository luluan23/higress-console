<template>
  <div class="ai-page">
    <div class="ai-page__header">
      <h2 class="ai-page__title">AI 路由</h2>
      <t-button theme="primary" @click="openCreate">添加路由</t-button>
    </div>

    <div class="ai-page__filters">
      <t-input
        v-model="search"
        placeholder="搜索路由名称"
        clearable
        style="width: 240px"
      />
    </div>

    <t-table
      :data="filteredRoutes"
      :columns="columns"
      row-key="name"
      :loading="aiStore.loadingRoutes"
      stripe
      hover
    >
      <template #domains="{ row }">
        <t-space break-line>
          <t-tag v-for="d in (row.domains || [])" :key="d" variant="light" size="small">{{ d }}</t-tag>
        </t-space>
      </template>
      <template #upstreams="{ row }">
        <div v-for="(u, idx) in (row.upstreams || [])" :key="idx" class="upstream-summary">
          {{ u.provider }} <span v-if="u.weight">×{{ u.weight }}</span>
        </div>
      </template>
      <template #authEnabled="{ row }">
        <t-tag :theme="row.authConfig?.enabled ? 'primary' : 'default'" variant="light">
          {{ row.authConfig?.enabled ? '启用' : '关闭' }}
        </t-tag>
      </template>
      <template #fallbackEnabled="{ row }">
        <t-tag :theme="row.fallbackConfig?.enabled ? 'warning' : 'default'" variant="light">
          {{ row.fallbackConfig?.enabled ? '启用' : '关闭' }}
        </t-tag>
      </template>
      <template #op="{ row }">
        <t-space>
          <t-button variant="text" size="small" @click="openEdit(row)">编辑</t-button>
          <t-button variant="text" size="small" theme="danger" @click="confirmDelete(row)">删除</t-button>
        </t-space>
      </template>
    </t-table>

    <RouteDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :initial-data="drawerData"
      @saved="onSaved"
    />
  </div>
</template>

<script>
import { useAiStore } from '@/stores/modules/aiStore'
import { DialogPlugin } from 'tdesign-vue-next'
import RouteDrawer from './RouteDrawer.vue'

export default {
  name: 'RoutePage',
  components: { RouteDrawer },
  data() {
    return {
      search: '',
      drawerVisible: false,
      drawerMode: 'create',
      drawerData: null,
      columns: [
        { colKey: 'name', title: '路由名称' },
        { colKey: 'domains', title: '域名', cell: 'domains' },
        { colKey: 'upstreams', title: '上游 Provider', cell: 'upstreams' },
        { colKey: 'authEnabled', title: '鉴权状态', cell: 'authEnabled' },
        { colKey: 'fallbackEnabled', title: 'Fallback', cell: 'fallbackEnabled' },
        { colKey: 'op', title: '操作', cell: 'op', width: 120 },
      ],
    }
  },
  computed: {
    aiStore() { return useAiStore() },
    filteredRoutes() {
      return this.aiStore.routes.filter((r) => {
        return !this.search || r.name?.includes(this.search)
      })
    },
  },
  created() {
    this.aiStore.fetchRoutes()
    this.aiStore.fetchConsumers()
  },
  methods: {
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
        body: `确认删除路由「${row.name}」？`,
        confirmBtn: { content: '确认删除', theme: 'danger' },
        onConfirm: async () => {
          await this.aiStore.deleteRoute(row.name)
          dialog.hide()
        },
        onClose: () => dialog.hide(),
      })
    },
    onSaved() {
      this.drawerVisible = false
      this.aiStore.fetchRoutes()
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

.upstream-summary {
  font-size: 12px;
  color: var(--text-secondary, #4a5568);
}
</style>
