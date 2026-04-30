<template>
  <div ref="chartEl" class="chart-wrapper"></div>
</template>

<script>
import * as echarts from 'echarts'
import { useThemeStore } from '@/stores/modules/themeStore'
import { mapState } from 'pinia'

export default {
  name: 'StackedBarChart',
  props: {
    option: { type: Object, required: true },
  },
  computed: {
    ...mapState(useThemeStore, ['resolvedTheme']),
  },
  watch: {
    option(val) {
      this.chart?.setOption({ ...val, backgroundColor: 'transparent' }, { notMerge: true })
    },
    resolvedTheme() {
      this.initChart()
    },
  },
  mounted() {
    this.initChart()
    this._resizeObs = new ResizeObserver(() => this.chart?.resize())
    this._resizeObs.observe(this.$refs.chartEl)
  },
  beforeUnmount() {
    this._resizeObs?.disconnect()
    this.chart?.dispose()
  },
  methods: {
    initChart() {
      if (this.chart) {
        this.chart.dispose()
      }
      const theme = this.resolvedTheme === 'dark' ? 'dark' : undefined
      this.chart = echarts.init(this.$refs.chartEl, theme)
      this.chart.setOption({ ...this.option, backgroundColor: 'transparent' })
    },
  },
}
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
