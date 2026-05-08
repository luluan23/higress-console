<template>
  <div class="ai-statistics-panel ai-statistics-detail-table">
    <div class="ai-statistics-panel__header">
      <div>
        <h3>明细视图</h3>
        <span>按维度查看当前筛选窗口内的聚合 Token 结果</span>
      </div>
      <el-radio-group :model-value="view" @update:model-value="$emit('update:view', $event)">
        <el-radio-button value="consumer">按消费者</el-radio-button>
        <el-radio-button value="model">按模型</el-radio-button>
        <el-radio-button value="route">按路由</el-radio-button>
      </el-radio-group>
    </div>

    <el-table :data="rows" empty-text="暂无明细">
      <el-table-column :label="dimensionLabel" min-width="200">
        <template #default="scope">{{ scope.row.dimension }}</template>
      </el-table-column>
      <el-table-column label="Token" width="140">
        <template #default="scope">{{ scope.row.value }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: { type: Array, required: true },
  view: { type: String, required: true },
})

defineEmits(['update:view'])

const dimensionLabel = computed(() => {
  if (props.view === 'model') {
    return '模型'
  }

  if (props.view === 'route') {
    return '路由'
  }

  return '消费者'
})
</script>