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

  function isActiveRequest(requestId) {
    return requestId === activeRequest
  }

  function shouldRefreshOptions() {
    return (
      !filters.consumers.length &&
      !filters.models.length &&
      !filters.routes.length
    )
  }

  function getResultRows(result, dimensionField) {
    if (result.status !== 'fulfilled') {
      return []
    }

    return normalizeTableRows(result.value, dimensionField)
  }

  function getTrendRows(result) {
    if (result.status !== 'fulfilled') {
      return []
    }

    return normalizeTrendSeries(result.value)
  }

  function hasFrameValues(payload) {
    return Boolean(
      payload?.results?.A?.frames?.some((frame) =>
        (frame?.data?.values || []).some((fieldValues) => fieldValues?.length)
      )
    )
  }

  function getFirstErrorMessage(results) {
    const rejection = results.find((result) => result.status === 'rejected')
    const reason = rejection?.reason

    return reason?.msg || reason?.message || '加载统计数据失败'
  }

  async function resolveDatasource(requestId) {
    const dashboardInfoResponse = await getAiDashboardInfo()
    if (!isActiveRequest(requestId)) {
      return null
    }

    const dashboardInfo = dashboardInfoResponse?.data || {}

    dashboardUrl.value = dashboardInfo.url || ''

    if (!dashboardInfo.uid) {
      datasourceUid.value = ''
      return ''
    }

    const dashboardResponse = await getGrafanaDashboard(dashboardInfo.uid)
    if (!isActiveRequest(requestId)) {
      return null
    }

    const nextDatasourceUid = parsePrometheusDatasourceUid(dashboardResponse)
    datasourceUid.value = nextDatasourceUid

    return nextDatasourceUid
  }

  async function loadDashboard() {
    const requestId = ++activeRequest
    loading.value = true
    errorMessage.value = ''

    try {
      const nextDatasourceUid = datasourceUid.value || (await resolveDatasource(requestId))

      if (!isActiveRequest(requestId)) {
        return
      }

      if (!nextDatasourceUid) {
        state.value = 'not-ready'
        return
      }

      const [consumerResult, modelResult, routeResult, trendResult, latencyResult] =
        await Promise.allSettled([
        queryGrafanaDatasource({
          dataSourceUid: nextDatasourceUid,
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
          dataSourceUid: nextDatasourceUid,
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
          dataSourceUid: nextDatasourceUid,
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
          dataSourceUid: nextDatasourceUid,
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
          dataSourceUid: nextDatasourceUid,
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

      if (!isActiveRequest(requestId)) {
        return
      }

      const nextConsumerRanking = getResultRows(consumerResult, 'ai_consumer')
      const nextModelRanking = getResultRows(modelResult, 'ai_model')
      const nextRouteRanking = getResultRows(routeResult, 'ai_route')
      const nextTrendSeries = getTrendRows(trendResult)
      const hasLatencyData =
        latencyResult.status === 'fulfilled' && hasFrameValues(latencyResult.value)
      const averageFirstToken = hasLatencyData ? normalizeFirstValue(latencyResult.value) : 0

      consumerRanking.value = nextConsumerRanking
      modelRanking.value = nextModelRanking
      routeRanking.value = nextRouteRanking
      trendSeries.value = nextTrendSeries

      if (shouldRefreshOptions() || !options.consumers.length) {
        options.consumers = nextConsumerRanking.map((item) => item.dimension)
      }

      if (shouldRefreshOptions() || !options.models.length) {
        options.models = nextModelRanking.map((item) => item.dimension)
      }

      if (shouldRefreshOptions() || !options.routes.length) {
        options.routes = nextRouteRanking.map((item) => item.dimension)
      }

      const nextInsights = buildInsights({
        consumerRanking: nextConsumerRanking,
        modelRanking: nextModelRanking,
        averageFirstToken,
      })

      if (!hasLatencyData && nextInsights.length) {
        nextInsights.pop()
      }

      insights.value = nextInsights

      const hasAnyData = Boolean(
        nextConsumerRanking.length ||
          nextModelRanking.length ||
          nextRouteRanking.length ||
          nextTrendSeries.length ||
          hasLatencyData
      )
      const hasAnyFailure = [
        consumerResult,
        modelResult,
        routeResult,
        trendResult,
        latencyResult,
      ].some((result) => result.status === 'rejected')

      if (hasAnyData) {
        lastUpdatedAt.value = new Date().toISOString()
        state.value = 'ready'
        return
      }

      if (hasAnyFailure) {
        errorMessage.value = getFirstErrorMessage([
          consumerResult,
          modelResult,
          routeResult,
          trendResult,
          latencyResult,
        ])
        state.value = 'error'
        return
      }

      state.value = 'empty'
    } catch (error) {
      if (!isActiveRequest(requestId)) {
        return
      }

      errorMessage.value = error?.msg || error?.message || '加载统计数据失败'
      state.value = 'error'
    } finally {
      if (isActiveRequest(requestId)) {
        loading.value = false
      }
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