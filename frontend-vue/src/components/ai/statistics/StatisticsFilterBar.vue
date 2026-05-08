<template>
  <div class="ai-statistics-filter-bar">
    <el-select :model-value="filters.timeRange.preset" placeholder="时间范围" @change="onTimeRangeChange">
      <el-option v-for="item in TIME_RANGE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>

    <el-select :model-value="filters.granularity" placeholder="粒度" @change="onGranularityChange">
      <el-option label="按小时" value="hour" />
      <el-option label="按天" value="day" />
    </el-select>

    <el-select
      :model-value="filters.consumers"
      multiple
      collapse-tags
      collapse-tags-tooltip
      placeholder="消费者"
      @change="onConsumersChange"
    >
      <el-option v-for="item in options.consumers" :key="item" :label="item" :value="item" />
    </el-select>

    <el-select
      :model-value="filters.models"
      multiple
      collapse-tags
      collapse-tags-tooltip
      placeholder="模型"
      @change="onModelsChange"
    >
      <el-option v-for="item in options.models" :key="item" :label="item" :value="item" />
    </el-select>

    <el-select
      :model-value="filters.routes"
      multiple
      collapse-tags
      collapse-tags-tooltip
      placeholder="路由"
      @change="onRoutesChange"
    >
      <el-option v-for="item in options.routes" :key="item" :label="item" :value="item" />
    </el-select>

    <el-button data-testid="refresh-statistics" type="primary" @click="$emit('refresh')">刷新</el-button>
    <el-button data-testid="reset-statistics" @click="$emit('reset')">重置</el-button>
  </div>
</template>

<script setup>
const TIME_RANGE_OPTIONS = [
  { label: '最近 24 小时', value: '24h', from: 'now-24h', to: 'now' },
  { label: '最近 7 天', value: '7d', from: 'now-7d', to: 'now' },
  { label: '最近 30 天', value: '30d', from: 'now-30d', to: 'now' },
]

const props = defineProps({
  filters: { type: Object, required: true },
  options: { type: Object, required: true },
})

const emit = defineEmits(['update:filters', 'refresh', 'reset'])

function updateFilters(patch) {
  emit('update:filters', {
    ...props.filters,
    ...patch,
  })
}

function onTimeRangeChange(value) {
  const preset = TIME_RANGE_OPTIONS.find((item) => item.value === value)

  updateFilters({
    timeRange: preset
      ? { from: preset.from, to: preset.to, preset: preset.value }
      : props.filters.timeRange,
  })
}

function onGranularityChange(value) {
  updateFilters({ granularity: value })
}

function onConsumersChange(value) {
  updateFilters({ consumers: value })
}

function onModelsChange(value) {
  updateFilters({ models: value })
}

function onRoutesChange(value) {
  updateFilters({ routes: value })
}
</script>