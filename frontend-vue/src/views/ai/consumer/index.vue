<template>
  <div class="ai-page">
    <div class="ai-page__header">
      <h2 class="ai-page__title">消费者 KEY</h2>
      <t-button theme="primary" @click="openCreate">添加消费者</t-button>
    </div>

    <div class="ai-page__filters">
      <t-input
        v-model="search"
        placeholder="搜索消费者名称"
        clearable
        style="width: 240px"
      />
    </div>

    <t-table
      :data="filteredConsumers"
      :columns="columns"
      row-key="name"
      :loading="aiStore.loadingConsumers"
      stripe
      hover
    >
      <template #authType="{ row }">
        <t-tag variant="light" theme="primary">{{ row.credentials?.[0]?.type || 'key-auth' }}</t-tag>
      </template>
      <template #keySource="{ row }">
        {{ row.credentials?.[0]?.source || '-' }}
      </template>
      <template #keyCount="{ row }">
        {{ row.credentials?.length || 0 }} 个
      </template>
      <template #op="{ row }">
        <t-space>
          <t-button variant="text" size="small" @click="openEdit(row)">编辑</t-button>
          <t-button variant="text" size="small" theme="danger" @click="confirmDelete(row)">删除</t-button>
        </t-space>
      </template>
    </t-table>

    <ConsumerDrawer
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
import ConsumerDrawer from './ConsumerDrawer.vue'

export default {
  name: 'ConsumerPage',
  components: { ConsumerDrawer },
  data() {
    return {
      search: '',
      drawerVisible: false,
      drawerMode: 'create',
      drawerData: null,
      columns: [
        { colKey: 'name', title: '消费者名称' },
        { colKey: 'authType', title: '认证类型', cell: 'authType' },
        { colKey: 'keySource', title: 'Key 来源', cell: 'keySource' },
        { colKey: 'keyCount', title: 'Key 数量', cell: 'keyCount' },
        { colKey: 'op', title: '操作', cell: 'op', width: 120 },
      ],
    }
  },
  computed: {
    aiStore() { return useAiStore() },
    filteredConsumers() {
      return this.aiStore.consumers.filter((c) => {
        return !this.search || c.name?.includes(this.search)
      })
    },
  },
  created() {
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
        body: `确认删除消费者「${row.name}」？`,
        confirmBtn: { content: '确认删除', theme: 'danger' },
        onConfirm: async () => {
          await this.aiStore.deleteConsumer(row.name)
          dialog.hide()
        },
        onClose: () => dialog.hide(),
      })
    },
    onSaved() {
      this.drawerVisible = false
      this.aiStore.fetchConsumers()
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
</style>
