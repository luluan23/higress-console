<template>
  <div class="ai-statistics-panel">
    <div class="ai-statistics-panel__header">
      <div>
        <h3>{{ title }}</h3>
        <span>{{ subtitle }}</span>
      </div>
    </div>
    <div ref="chartRef" class="ai-statistics-chart"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEChart } from './useEChart'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  rows: { type: Array, required: true },
})

const chartRef = ref(null)

const option = computed(() => ({
  color: ['#0f766e', '#0ea5e9', '#f59e0b', '#f97316', '#475569'],
  tooltip: { trigger: 'item' },
  legend: {
    bottom: 0,
    icon: 'circle',
    textStyle: { color: '#475569' },
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '72%'],
      center: ['50%', '44%'],
      label: { color: '#334155' },
      data: props.rows.map((item) => ({ name: item.dimension, value: item.value })),
    },
  ],
}))

useEChart(chartRef, option)
</script>