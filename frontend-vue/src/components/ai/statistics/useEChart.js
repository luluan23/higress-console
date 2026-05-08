import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, watch } from 'vue'

export function useEChart(containerRef, optionRef) {
  let chartInstance = null

  async function render() {
    await nextTick()

    if (!containerRef.value || typeof echarts.init !== 'function' || !optionRef.value) {
      return
    }

    if (!chartInstance) {
      chartInstance = echarts.init(containerRef.value)
    }

    chartInstance.setOption(optionRef.value, true)
  }

  watch(optionRef, render, { deep: true, immediate: true })

  onBeforeUnmount(() => {
    chartInstance?.dispose()
    chartInstance = null
  })
}