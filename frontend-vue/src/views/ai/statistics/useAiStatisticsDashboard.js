import { onMounted, reactive, ref } from 'vue'
import {
  getAiDashboardInfo,
  getGrafanaDashboard,
  queryGrafanaDatasource,
} from '@/api/aiStatisticsApi'
import { METRICS } from './metricCatalog'
import {
  buildAverageQuery,
  buildGroupedIncreaseQuery,
  buildTrendQuery,
  createDefaultFilters,
} from './queryBuilder'
import {
  buildInsights,
  normalizeFirstValue,
  normalizeTableRows,
  normalizeTrendSeries,
  parsePrometheusDatasourceUid,
} from './transform'

export function useAiStatisticsDashboard() {
  const filters = reactive(createDefaultFilters())
  const loading = ref(false)
  const dashboardUrl = ref('')
  const state = ref('idle')
  const errorMessage = ref('')
  const datasourceUid = ref('')
  const options = reactive({ consumers: [], models: [], routes: [] })
  const consumerRanking = ref([])
  const modelRanking = ref([])
  const routeRanking = ref([])
  const trendSeries = ref([])
  const insights = ref([])
  const lastUpdatedAt = ref('')
  let activeRequest = 0

  async function resolveDatasource() {
    const dashboardInfoResponse = await getAiDashboardInfo()
    const dashboardInfo = dashboardInfoResponse?.data || {}

    dashboardUrl.value = dashboardInfo.url || ''

    if (!dashboardInfo.uid) {
      datasourceUid.value = ''
      return
    }

    const dashboardResponse = await getGrafanaDashboard(dashboardInfo.uid)
    datasourceUid.value = parsePrometheusDatasourceUid(dashboardResponse)
  }

  async function loadDashboard() {
    const requestId = ++activeRequest
    loading.value = true
    errorMessage.value = ''

    try {
      if (!datasourceUid.value) {
        await resolveDatasource()
      }

      if (!datasourceUid.value) {
        state.value = 'not-ready'
        return
      }

      const [consumerResult, modelResult, routeResult, trendResult, latencyResult] = await Promise.all([
        queryGrafanaDatasource({
          dataSourceUid: datasourceUid.value,
          from: filters.timeRange.from,
          to: filters.timeRange.to,
          queries: [
            buildGroupedIncreaseQuery({
              refId: 'A',
              metric: METRICS.totalToken,
              groupBy: 'ai_consumer',
              filters,
              rangeToken: '$__range',
            }),
          ],
        }),
        queryGrafanaDatasource({
          dataSourceUid: datasourceUid.value,
          from: filters.timeRange.from,
          to: filters.timeRange.to,
          queries: [
            buildGroupedIncreaseQuery({
              refId: 'A',
              metric: METRICS.totalToken,
              groupBy: 'ai_model',
              filters,
              rangeToken: '$__range',
            }),
          ],
        }),
        queryGrafanaDatasource({
          dataSourceUid: datasourceUid.value,
          from: filters.timeRange.from,
          to: filters.timeRange.to,
          queries: [
            buildGroupedIncreaseQuery({
              refId: 'A',
              metric: METRICS.totalToken,
              groupBy: 'ai_route',
              filters,
              rangeToken: '$__range',
            }),
          ],
        }),
        queryGrafanaDatasource({
          dataSourceUid: datasourceUid.value,
          from: filters.timeRange.from,
          to: filters.timeRange.to,
          queries: [
            buildTrendQuery({
              refId: 'A',
              metric: METRICS.totalToken,
              filters,
              rangeToken: '$__range',
            }),
          ],
        }),
        queryGrafanaDatasource({
          dataSourceUid: datasourceUid.value,
          from: filters.timeRange.from,
          to: filters.timeRange.to,
          queries: [
            buildAverageQuery({
              refId: 'A',
              numeratorMetric: METRICS.firstTokenDuration,
              denominatorMetric: METRICS.requestCount,
              filters,
              rangeToken: '$__range',
            }),
          ],
        }),
      ])

      if (requestId !== activeRequest) {
        return
      }

      consumerRanking.value = normalizeTableRows(consumerResult, 'ai_consumer')
      modelRanking.value = normalizeTableRows(modelResult, 'ai_model')
      routeRanking.value = normalizeTableRows(routeResult, 'ai_route')
      trendSeries.value = normalizeTrendSeries(trendResult)

      const averageFirstToken = normalizeFirstValue(latencyResult)

      options.consumers = consumerRanking.value.map((item) => item.dimension)
      options.models = modelRanking.value.map((item) => item.dimension)
      options.routes = routeRanking.value.map((item) => item.dimension)
      insights.value = buildInsights({
        consumerRanking: consumerRanking.value,
        modelRanking: modelRanking.value,
        averageFirstToken,
      })
      lastUpdatedAt.value = new Date().toISOString()
      state.value = consumerRanking.value.length || modelRanking.value.length ? 'ready' : 'empty'
    } catch (error) {
      errorMessage.value = error?.msg || error?.message || '加载统计数据失败'
      state.value = 'error'
    } finally {
      loading.value = false
    }
  }

  function refresh() {
    return loadDashboard()
  }

  function resetFilters() {
    Object.assign(filters, createDefaultFilters())
    return loadDashboard()
  }

  function patchFilters(nextFilters) {
    Object.assign(filters, nextFilters)
  }

  function applyDrilldown(type, value) {
    if (type === 'consumer') {
      filters.consumers = [value]
    }
    if (type === 'model') {
      filters.models = [value]
    }
    if (type === 'route') {
      filters.routes = [value]
    }
  }

  onMounted(loadDashboard)

  return {
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
  }
}