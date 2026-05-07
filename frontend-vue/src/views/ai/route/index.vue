<template>
  <div class="ai-console-page ai-console-page--table">
    <PageToolbar title="AI 路由管理" description="管理域名、Upstream、鉴权与 Fallback 策略">
      <template #filters>
        <el-input v-model="query" placeholder="搜索路由" clearable @change="loadRoutes" />
      </template>
      <template #actions>
        <el-button type="primary" @click="openCreate">新增路由</el-button>
      </template>
    </PageToolbar>

    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="name" label="路由名称" min-width="180" />
      <el-table-column label="域名" min-width="200">
        <template #default="scope">{{ scope.row.domains.join(', ') }}</template>
      </el-table-column>
      <el-table-column label="上游" min-width="220">
        <template #default="scope">{{ scope.row.upstreamSummary }}</template>
      </el-table-column>
      <el-table-column label="鉴权" width="120">
        <template #default="scope">
          <StatusTag :label="scope.row.authLabel" :tone="scope.row.authTone" />
        </template>
      </el-table-column>
      <el-table-column label="Fallback" width="120">
        <template #default="scope">
          <StatusTag :label="scope.row.fallbackLabel" :tone="scope.row.fallbackTone" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button text @click="openEdit(scope.row.name)">编辑</el-button>
          <el-button text type="danger" @click="openDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <RouteDrawer
      :visible="drawerVisible"
      :mode="drawerMode"
      :model-value="formModel"
      :consumer-options="consumerOptions"
      :provider-options="providerOptions"
      :saving="saving"
      @close="drawerVisible = false"
      @submit="submitRoute"
    />

    <DeleteConfirmDialog
      :visible="deleteVisible"
      title="删除 AI 路由"
      :message="deleteMessage"
      @cancel="deleteVisible = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
defineOptions({
  name: 'AiRoutePage',
})

import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createAiRoute,
  deleteAiRoute,
  getAiRoute,
  listAiRoutes,
  listConsumers,
  listProviders,
  updateAiRoute,
} from '@/api/aiApi'
import DeleteConfirmDialog from '@/components/ai/DeleteConfirmDialog.vue'
import PageToolbar from '@/components/ai/PageToolbar.vue'
import StatusTag from '@/components/ai/StatusTag.vue'
import RouteDrawer from './RouteDrawer.vue'
import {
  createRouteForm,
  routeFromApi,
  toRoutePayload,
  validateRouteForm,
} from './routeModel'

const loading = ref(false)
const saving = ref(false)
const query = ref('')
const rows = ref([])
const drawerVisible = ref(false)
const drawerMode = ref('create')
const formModel = ref(createRouteForm())
const consumerOptions = ref([])
const providerOptions = ref([])
const deleteVisible = ref(false)
const deletingName = ref('')

const deleteMessage = computed(() => `删除 ${deletingName.value} 后将无法恢复。`)

function getErrorMessage(error, fallback) {
  return error?.msg || error?.message || fallback
}

function decorateRoute(route) {
  return {
    ...route,
    upstreamSummary: (route.upstreams || [])
      .map((item) => `${item.provider} (${item.weight})`)
      .join(', '),
    authLabel: route.authConfig?.enabled ? '已启用' : '未启用',
    authTone: route.authConfig?.enabled ? 'success' : 'default',
    fallbackLabel: route.fallbackConfig?.enabled ? '已启用' : '未启用',
    fallbackTone: route.fallbackConfig?.enabled ? 'warning' : 'default',
  }
}

async function loadRoutes() {
  loading.value = true
  try {
    const [routeResponse, consumerResponse, providerResponse] = await Promise.all([
      listAiRoutes(),
      listConsumers(),
      listProviders(),
    ])

    rows.value = (routeResponse?.data || [])
      .filter((item) => !query.value || item.name.includes(query.value))
      .map(decorateRoute)
    consumerOptions.value = (consumerResponse?.data || []).map((item) => item.name)
    providerOptions.value = (providerResponse?.data || []).map((item) => item.name)
  } catch (error) {
    rows.value = []
    consumerOptions.value = []
    providerOptions.value = []
    ElMessage.error(getErrorMessage(error, '加载 AI 路由失败'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  drawerMode.value = 'create'
  formModel.value = createRouteForm()
  drawerVisible.value = true
}

async function openEdit(name) {
  try {
    const response = await getAiRoute(name)

    formModel.value = routeFromApi(response.data)
    drawerMode.value = 'edit'
    drawerVisible.value = true
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '加载 AI 路由详情失败'))
  }
}

function openDelete(row) {
  deletingName.value = row.name
  deleteVisible.value = true
}

async function submitRoute(model) {
  const errors = validateRouteForm(model)

  if (errors.length) {
    ElMessage.error(errors[0])
    return
  }

  saving.value = true
  try {
    const payload = toRoutePayload(model)

    if (drawerMode.value === 'create') {
      await createAiRoute(payload)
    } else {
      await updateAiRoute(payload)
    }

    drawerVisible.value = false
    ElMessage.success('保存成功')
    await loadRoutes()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '保存 AI 路由失败'))
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  try {
    await deleteAiRoute(deletingName.value)
    deleteVisible.value = false
    ElMessage.success('删除成功')
    await loadRoutes()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '删除 AI 路由失败'))
  }
}

onMounted(loadRoutes)
</script>