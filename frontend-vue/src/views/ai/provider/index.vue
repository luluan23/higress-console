<template>
  <div class="ai-console-page ai-console-page--table">
    <PageToolbar title="服务提供者" description="管理大模型服务提供者和 Token 策略">
      <template #filters>
        <el-input
          v-model="query"
          placeholder="搜索 Provider"
          clearable
          @change="loadProviders"
        />
      </template>
      <template #actions>
        <el-button type="primary" @click="openCreate">新增服务提供者</el-button>
      </template>
    </PageToolbar>

    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="name" label="Provider 名称" min-width="180" />
      <el-table-column prop="type" label="类型" width="140" />
      <el-table-column prop="protocol" label="协议" width="140" />
      <el-table-column label="Token 模式" width="160">
        <template #default="scope">{{ scope.row.tokenModeLabel }}</template>
      </el-table-column>
      <el-table-column label="状态" width="140">
        <template #default>
          <StatusTag label="未检测" tone="default" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button text @click="openEdit(scope.row.name)">编辑</el-button>
          <el-button text type="danger" @click="openDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <ProviderDrawer
      :visible="drawerVisible"
      :mode="drawerMode"
      :model-value="formModel"
      :saving="saving"
      @close="drawerVisible = false"
      @submit="submitProvider"
    />

    <DeleteConfirmDialog
      :visible="deleteVisible"
      title="删除服务提供者"
      :message="deleteMessage"
      @cancel="deleteVisible = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
defineOptions({
  name: 'AiProviderPage',
})

import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createProvider,
  deleteProvider,
  getProvider,
  listProviders,
  updateProvider,
} from '@/api/aiApi'
import DeleteConfirmDialog from '@/components/ai/DeleteConfirmDialog.vue'
import PageToolbar from '@/components/ai/PageToolbar.vue'
import StatusTag from '@/components/ai/StatusTag.vue'
import ProviderDrawer from './ProviderDrawer.vue'
import {
  createProviderForm,
  getTokenModeLabel,
  providerFromApi,
  toProviderPayload,
  validateProviderForm,
} from './providerModel'

const loading = ref(false)
const saving = ref(false)
const query = ref('')
const rows = ref([])
const drawerVisible = ref(false)
const drawerMode = ref('create')
const formModel = ref(createProviderForm())
const deleteVisible = ref(false)
const deletingName = ref('')

const deleteMessage = computed(() => `删除 ${deletingName.value} 后将无法恢复。`)

function getErrorMessage(error, fallback) {
  return error?.msg || error?.message || fallback
}

async function loadProviders() {
  loading.value = true
  try {
    const response = await listProviders(query.value ? { query: query.value } : undefined)
    const providers = response?.data || []

    rows.value = providers.map((provider) => ({
      ...provider,
      tokenModeLabel: getTokenModeLabel(provider),
    }))
  } catch (error) {
    rows.value = []
    ElMessage.error(getErrorMessage(error, '加载服务提供者失败'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  drawerMode.value = 'create'
  formModel.value = createProviderForm()
  drawerVisible.value = true
}

async function openEdit(name) {
  try {
    const response = await getProvider(name)

    formModel.value = providerFromApi(response.data)
    drawerMode.value = 'edit'
    drawerVisible.value = true
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '加载服务提供者详情失败'))
  }
}

function openDelete(row) {
  deletingName.value = row.name
  deleteVisible.value = true
}

async function submitProvider(model) {
  const errors = validateProviderForm(model)

  if (errors.length) {
    ElMessage.error(errors[0])
    return
  }

  saving.value = true
  try {
    const payload = toProviderPayload(model)

    if (drawerMode.value === 'create') {
      await createProvider(payload)
    } else {
      await updateProvider(payload)
    }

    drawerVisible.value = false
    ElMessage.success('保存成功')
    await loadProviders()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '保存服务提供者失败'))
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  try {
    await deleteProvider(deletingName.value)
    deleteVisible.value = false
    ElMessage.success('删除成功')
    await loadProviders()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '删除服务提供者失败'))
  }
}

onMounted(loadProviders)
</script>