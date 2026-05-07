<template>
  <div class="ai-array-field">
    <div v-for="(item, index) in modelValue" :key="index" class="ai-array-field__card">
      <div class="ai-array-field__meta">
        <el-select
          :model-value="item.provider"
          placeholder="选择 Provider"
          @update:model-value="updateUpstream(index, 'provider', $event)"
        >
          <el-option
            v-for="option in providerOptions"
            :key="option"
            :label="option"
            :value="option"
          />
        </el-select>
        <el-input-number
          :model-value="item.weight"
          :min="1"
          @update:model-value="updateUpstream(index, 'weight', $event)"
        />
        <el-button text type="danger" @click="removeUpstream(index)">删除</el-button>
      </div>
      <div class="ai-array-field__mapping-label">模型映射</div>
      <div
        v-for="(row, rowIndex) in item.modelMappingRows"
        :key="`${index}-${rowIndex}`"
        class="ai-array-field__mapping-row"
      >
        <el-input
          :model-value="row.source"
          placeholder="来源模型"
          @update:model-value="updateMappingRow(index, rowIndex, 'source', $event)"
        />
        <el-input
          :model-value="row.target"
          placeholder="目标模型"
          @update:model-value="updateMappingRow(index, rowIndex, 'target', $event)"
        />
        <el-button text type="danger" @click="removeMappingRow(index, rowIndex)">删除</el-button>
      </div>
      <el-button text @click="addMappingRow(index)">新增模型映射</el-button>
    </div>
    <el-button @click="addUpstream">新增 Upstream</el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
  providerOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

function addUpstream() {
  emit('update:modelValue', [
    ...props.modelValue,
    { provider: '', weight: 100, modelMappingRows: [] },
  ])
}

function removeUpstream(index) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, currentIndex) => currentIndex !== index)
  )
}

function updateUpstream(index, field, value) {
  emit(
    'update:modelValue',
    props.modelValue.map((item, currentIndex) =>
      currentIndex === index ? { ...item, [field]: value } : item
    )
  )
}

function addMappingRow(index) {
  emit(
    'update:modelValue',
    props.modelValue.map((item, currentIndex) => {
      if (currentIndex !== index) {
        return item
      }

      return {
        ...item,
        modelMappingRows: [...item.modelMappingRows, { source: '', target: '' }],
      }
    })
  )
}

function removeMappingRow(index, rowIndex) {
  emit(
    'update:modelValue',
    props.modelValue.map((item, currentIndex) => {
      if (currentIndex !== index) {
        return item
      }

      return {
        ...item,
        modelMappingRows: item.modelMappingRows.filter(
          (_, currentRowIndex) => currentRowIndex !== rowIndex
        ),
      }
    })
  )
}

function updateMappingRow(index, rowIndex, field, value) {
  emit(
    'update:modelValue',
    props.modelValue.map((item, currentIndex) => {
      if (currentIndex !== index) {
        return item
      }

      return {
        ...item,
        modelMappingRows: item.modelMappingRows.map((row, currentRowIndex) =>
          currentRowIndex === rowIndex ? { ...row, [field]: value } : row
        ),
      }
    })
  )
}
</script>