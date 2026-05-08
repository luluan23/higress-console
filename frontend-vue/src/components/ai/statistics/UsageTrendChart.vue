<template>
  <div class="ai-statistics-panel">
    <div class="ai-statistics-panel__header">
      <div>
        <h3>核心趋势</h3>
        <span>Token 与时延趋势</span>
      </div>
    </div>
    <div ref="chartRef" class="ai-statistics-chart"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEChart } from './useEChart'

const props = defineProps({
  series: { type: Array, required: true },
})

const chartRef = ref(null)

const option = computed(() => ({
  color: ['#0f766e'],
  tooltip: { trigger: 'axis' },
  grid: {
    top: 24,
    right: 12,
    bottom: 24,
    left: 12,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#cbd5e1' } },
    axisLabel: { color: '#64748b' },
    data: props.series.map((item) => new Date(item.timestamp).toLocaleDateString()),
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#e2e8f0' } },
    axisLabel: { color: '#64748b' },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      showSymbol: false,
      areaStyle: {
        color: 'rgba(15, 118, 110, 0.12)',
      },
      lineStyle: {
        width: 3,
      },
      data: props.series.map((item) => item.value),
    },
  ],
}))

useEChart(chartRef, option)
</script>