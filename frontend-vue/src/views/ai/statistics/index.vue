<template>
  <div v-loading="loading" class="ai-console-page ai-console-page--statistics">
    <PageToolbar title="统计看板" description="按时间、消费者、模型与路由查看 AI 使用规模、结构与风险">
      <template #actions>
        <el-link v-if="dashboardUrl" :href="dashboardUrl" target="_blank" type="primary">查看原始监控</el-link>
      </template>
    </PageToolbar>

    <StatisticsFilterBar
      :filters="filters"
      :options="options"
      @update:filters="handleFilterUpdate"
      @refresh="refresh"
      @reset="resetFilters"
    />

    <p v-if="lastUpdatedAt" class="ai-statistics-meta">最近刷新：{{ new Date(lastUpdatedAt).toLocaleString() }}</p>

    <StatisticsEmptyState
      v-if="!loading && state !== 'ready'"
      :title="emptyStateTitle"
      :message="emptyStateMessage"
      :link-url="dashboardUrl"
    />

    <template v-else-if="state === 'ready'">
      <StatisticsKpiRow :items="kpiItems" />

      <div class="ai-statistics-grid ai-statistics-grid--hero">
        <UsageTrendChart :series="trendSeries" />
        <DistributionChart title="消费者占比" subtitle="按总 Token" :rows="consumerRanking" />
      </div>

      <div class="ai-statistics-grid ai-statistics-grid--three">
        <TopRankingPanel
          title="消费者排行"
          subtitle="按总 Token 排序"
          :rows="consumerRanking"
          @select="handleDrilldown('consumer', $event)"
        />
        <TopRankingPanel
          title="模型排行"
          subtitle="按总 Token 排序"
          :rows="modelRanking"
          @select="handleDrilldown('model', $event)"
        />
        <InsightListPanel :items="insights" />
      </div>

      <StatisticsDetailTable :rows="detailRows" :view="detailView" @update:view="onDetailViewChange" />
    </template>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AiStatisticsPage',
})

import { computed, ref } from 'vue'
import PageToolbar from '@/components/ai/PageToolbar.vue'
import DistributionChart from '@/components/ai/statistics/DistributionChart.vue'
import InsightListPanel from '@/components/ai/statistics/InsightListPanel.vue'
import StatisticsDetailTable from '@/components/ai/statistics/StatisticsDetailTable.vue'
import StatisticsEmptyState from '@/components/ai/statistics/StatisticsEmptyState.vue'
import StatisticsFilterBar from '@/components/ai/statistics/StatisticsFilterBar.vue'
import StatisticsKpiRow from '@/components/ai/statistics/StatisticsKpiRow.vue'
import TopRankingPanel from '@/components/ai/statistics/TopRankingPanel.vue'
import UsageTrendChart from '@/components/ai/statistics/UsageTrendChart.vue'
import { useAiStatisticsDashboard } from './useAiStatisticsDashboard'

const {
  filters,
  options,
  loading,
  state,
  errorMessage,
  dashboardUrl,
  consumerRanking,
  modelRanking,
  routeRanking,
  trendSeries,
  insights,
  lastUpdatedAt,
  refresh,
  resetFilters,
  patchFilters,
  applyDrilldown,
} = useAiStatisticsDashboard()

const detailView = ref('consumer')

const emptyStateTitle = computed(() => {
  if (state.value === 'not-ready') {
    return '统计数据源未就绪'
  }

  if (state.value === 'error') {
    return '统计数据加载失败'
  }

  return '当前筛选暂无数据'
})

const emptyStateMessage = computed(() => {
  if (state.value === 'error') {
    return errorMessage.value || '加载统计数据失败'
  }

  return '请调整筛选条件或前往 Grafana 检查原始看板配置。'
})

const kpiItems = computed(() => [
  {
    key: 'consumerCount',
    label: '活跃消费者数',
    value: consumerRanking.value.length,
    deltaLabel: '按当前窗口聚合',
  },
  {
    key: 'modelCount',
    label: '活跃模型数',
    value: modelRanking.value.length,
    deltaLabel: '按当前窗口聚合',
  },
  {
    key: 'topConsumer',
    label: 'Top 消费者 Token',
    value: consumerRanking.value[0]?.value || 0,
    deltaLabel: consumerRanking.value[0]?.dimension || '无',
  },
  {
    key: 'topModel',
    label: 'Top 模型 Token',
    value: modelRanking.value[0]?.value || 0,
    deltaLabel: modelRanking.value[0]?.dimension || '无',
  },
])

const detailRows = computed(() => {
  if (detailView.value === 'model') {
    return modelRanking.value
  }

  if (detailView.value === 'route') {
    return routeRanking.value
  }

  return consumerRanking.value
})

function handleDrilldown(type, value) {
  detailView.value = type
  applyDrilldown(type, value)

  return refresh()
}

function handleFilterUpdate(nextFilters) {
  patchFilters(nextFilters)

  return refresh()
}

function onDetailViewChange(nextView) {
  detailView.value = nextView
}
</script>