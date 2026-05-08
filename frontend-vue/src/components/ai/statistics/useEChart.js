import * as echarts from 'echarts'
import { nextTick, onBeforeUnmount, watch } from 'vue'

export function useEChart(containerRef, optionRef) {
  let chartInstance = null
  let resizeObserver = null

  function resizeChart() {
    chartInstance?.resize()
  }

  async function render() {
    await nextTick()

    if (!containerRef.value || typeof echarts.init !== 'function' || !optionRef.value) {
      return
    }

    if (!chartInstance) {
      chartInstance = echarts.init(containerRef.value)

      if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'function') {
        resizeObserver = new window.ResizeObserver(resizeChart)
        resizeObserver.observe(containerRef.value)
      } else if (typeof window !== 'undefined') {
        window.addEventListener('resize', resizeChart)
      }
    }

    chartInstance.setOption(optionRef.value, true)
  }

  watch(optionRef, render, { deep: true, immediate: true })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()

    if (!resizeObserver && typeof window !== 'undefined') {
      window.removeEventListener('resize', resizeChart)
    }

    chartInstance?.dispose()
    chartInstance = null
    resizeObserver = null
  })
}