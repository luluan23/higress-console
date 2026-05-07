<template>
  <div class="ai-array-field">
    <div v-for="(item, index) in modelValue" :key="index" class="ai-array-field__card">
      <el-select
        :model-value="item.source"
        @update:model-value="updateCredential(index, 'source', $event)"
      >
        <el-option label="Bearer" value="BEARER" />
        <el-option label="Header" value="HEADER" />
        <el-option label="Query" value="QUERY" />
      </el-select>
      <el-input
        :model-value="item.key"
        placeholder="密钥"
        @update:model-value="updateCredential(index, 'key', $event)"
      />
      <el-input
        v-if="item.source === 'HEADER'"
        :model-value="item.headerName"
        placeholder="Header 名称"
        @update:model-value="updateCredential(index, 'headerName', $event)"
      />
      <el-input
        v-if="item.source === 'QUERY'"
        :model-value="item.queryName"
        placeholder="Query 参数名"
        @update:model-value="updateCredential(index, 'queryName', $event)"
      />
      <el-button text type="danger" @click="removeCredential(index)">删除</el-button>
    </div>
    <el-button @click="addCredential">新增凭证</el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

function addCredential() {
  emit('update:modelValue', [
    ...props.modelValue,
    { type: 'key-auth', key: '', source: 'BEARER', headerName: '', queryName: '' },
  ])
}

function removeCredential(index) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, currentIndex) => currentIndex !== index)
  )
}

function updateCredential(index, field, value) {
  emit(
    'update:modelValue',
    props.modelValue.map((item, currentIndex) => {
      if (currentIndex !== index) {
        return item
      }

      return {
        ...item,
        [field]: value,
        ...(field === 'source' && value === 'BEARER' ? { headerName: '', queryName: '' } : {}),
        ...(field === 'source' && value === 'HEADER' ? { queryName: '' } : {}),
        ...(field === 'source' && value === 'QUERY' ? { headerName: '' } : {}),
      }
    })
  )
}
</script>