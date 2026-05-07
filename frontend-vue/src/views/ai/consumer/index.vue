<template>
  <div class="ai-console-page ai-console-page--table">
    <PageToolbar title="消费者管理" description="管理 key-auth 消费者和凭证来源">
      <template #filters>
        <el-input v-model="query" placeholder="搜索消费者" clearable @change="loadConsumers" />
      </template>
      <template #actions>
        <el-button type="primary" @click="openCreate">新增消费者</el-button>
      </template>
    </PageToolbar>

    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="name" label="消费者名称" min-width="180" />
      <el-table-column label="凭证类型" width="140">
        <template #default="scope">{{ scope.row.credentialType }}</template>
      </el-table-column>
      <el-table-column label="来源类型" width="140">
        <template #default="scope">
          <StatusTag :label="scope.row.sourceLabel" :tone="scope.row.sourceTone" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button text @click="openEdit(scope.row.name)">编辑</el-button>
          <el-button text type="danger" @click="openDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <ConsumerDrawer
      :visible="drawerVisible"
      :mode="drawerMode"
      :model-value="formModel"
      :saving="saving"
      @close="drawerVisible = false"
      @submit="submitConsumer"
    />

    <DeleteConfirmDialog
      :visible="deleteVisible"
      title="删除消费者"
      :message="deleteMessage"
      @cancel="deleteVisible = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
defineOptions({
  name: 'AiConsumerPage',
})

import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createConsumer,
  deleteConsumer,
  getConsumer,
  listConsumers,
  updateConsumer,
} from '@/api/aiApi'
import DeleteConfirmDialog from '@/components/ai/DeleteConfirmDialog.vue'
import PageToolbar from '@/components/ai/PageToolbar.vue'
import StatusTag from '@/components/ai/StatusTag.vue'
import ConsumerDrawer from './ConsumerDrawer.vue'
import {
  consumerFromApi,
  createConsumerForm,
  toConsumerPayload,
  validateConsumerForm,
} from './consumerModel'

const loading = ref(false)
const saving = ref(false)
const query = ref('')
const rows = ref([])
const drawerVisible = ref(false)
const drawerMode = ref('create')
const formModel = ref(createConsumerForm())
const deleteVisible = ref(false)
const deletingName = ref('')

const deleteMessage = computed(() => `删除 ${deletingName.value} 后将无法恢复。`)

function getErrorMessage(error, fallback) {
  return error?.msg || error?.message || fallback
}

function decorateConsumer(consumer) {
  const firstCredential = consumer.credentials?.[0] || {}

  return {
    ...consumer,
    credentialType: firstCredential.type || 'key-auth',
    sourceLabel: firstCredential.source || 'BEARER',
    sourceTone:
      firstCredential.source === 'QUERY'
        ? 'warning'
        : firstCredential.source === 'HEADER'
          ? 'success'
          : 'default',
  }
}

async function loadConsumers() {
  loading.value = true
  try {
    const response = await listConsumers()

    rows.value = (response?.data || [])
      .filter((item) => !query.value || item.name.includes(query.value))
      .map(decorateConsumer)
  } catch (error) {
    rows.value = []
    ElMessage.error(getErrorMessage(error, '加载消费者失败'))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  drawerMode.value = 'create'
  formModel.value = createConsumerForm()
  drawerVisible.value = true
}

async function openEdit(name) {
  try {
    const response = await getConsumer(name)

    formModel.value = consumerFromApi(response.data)
    drawerMode.value = 'edit'
    drawerVisible.value = true
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '加载消费者详情失败'))
  }
}

function openDelete(row) {
  deletingName.value = row.name
  deleteVisible.value = true
}

async function submitConsumer(model) {
  const errors = validateConsumerForm(model)

  if (errors.length) {
    ElMessage.error(errors[0])
    return
  }

  saving.value = true
  try {
    const payload = toConsumerPayload(model)

    if (drawerMode.value === 'create') {
      await createConsumer(payload)
    } else {
      await updateConsumer(payload)
    }

    drawerVisible.value = false
    ElMessage.success('保存成功')
    await loadConsumers()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '保存消费者失败'))
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  try {
    await deleteConsumer(deletingName.value)
    deleteVisible.value = false
    ElMessage.success('删除成功')
    await loadConsumers()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '删除消费者失败'))
  }
}

onMounted(loadConsumers)
</script>