import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { nextTick, reactive, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StatisticsDetailTable from '@/components/ai/statistics/StatisticsDetailTable.vue'
import StatisticsFilterBar from '@/components/ai/statistics/StatisticsFilterBar.vue'
import TopRankingPanel from '@/components/ai/statistics/TopRankingPanel.vue'

const mockDashboard = vi.hoisted(() => ({
  useDashboard: vi.fn(),
}))

vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  })),
}))

vi.mock('@/views/ai/statistics/useAiStatisticsDashboard', () => ({
  useAiStatisticsDashboard: mockDashboard.useDashboard,
}))

import StatisticsPage from '@/views/ai/statistics/index.vue'

function createDashboardState(overrides = {}) {
  return {
    filters: reactive({
      timeRange: { from: 'now-7d', to: 'now', preset: '7d' },
      granularity: 'day',
      consumers: [],
      models: [],
      routes: [],
    }),
    options: reactive({
      consumers: ['KEY_USER_1'],
      models: ['deepseek-v4-flash'],
      routes: ['route-ai'],
    }),
    loading: ref(false),
    state: ref('ready'),
    errorMessage: ref(''),
    dashboardUrl: ref('/grafana/d/ai'),
    consumerRanking: ref([{ dimension: 'KEY_USER_1', value: 5400 }]),
    modelRanking: ref([{ dimension: 'deepseek-v4-flash', value: 6600 }]),
    routeRanking: ref([{ dimension: 'route-ai', value: 4700 }]),
    trendSeries: ref([
      { timestamp: 1715126400000, value: 3200 },
      { timestamp: 1715212800000, value: 4100 },
    ]),
    insights: ref(['消费者 KEY_USER_1 贡献了当前窗口内最高 Token 消耗。']),
    lastUpdatedAt: ref('2026-05-09T09:00:00.000Z'),
    refresh: vi.fn(() => Promise.resolve()),
    resetFilters: vi.fn(() => Promise.resolve()),
    patchFilters: vi.fn(),
    applyDrilldown: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  mockDashboard.useDashboard.mockReset()
  mockDashboard.useDashboard.mockReturnValue(createDashboardState())
})

describe('AI statistics page', () => {
  it('renders the dashboard shell and refreshes after filter and drill-down updates', async () => {
    const dashboard = createDashboardState()
    mockDashboard.useDashboard.mockReturnValue(dashboard)

    const wrapper = mount(StatisticsPage, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('统计看板')
    expect(wrapper.text()).toContain('查看原始监控')
    expect(wrapper.text()).toContain('KEY_USER_1')
    expect(wrapper.text()).toContain('deepseek-v4-flash')

    const nextFilters = {
      ...dashboard.filters,
      consumers: ['KEY_USER_1'],
    }

    await wrapper.findComponent(StatisticsFilterBar).vm.$emit('update:filters', nextFilters)

    expect(dashboard.patchFilters).toHaveBeenCalledWith(nextFilters)
    expect(dashboard.refresh).toHaveBeenCalledTimes(1)

    await wrapper.findAllComponents(TopRankingPanel)[0].vm.$emit('select', 'KEY_USER_1')

    expect(dashboard.applyDrilldown).toHaveBeenCalledWith('consumer', 'KEY_USER_1')
    expect(dashboard.refresh).toHaveBeenCalledTimes(2)

    await wrapper.findComponent(StatisticsDetailTable).vm.$emit('update:view', 'route')
    await nextTick()

    expect(wrapper.findComponent(StatisticsDetailTable).props('view')).toBe('route')
    expect(wrapper.findComponent(StatisticsDetailTable).props('rows')).toEqual(
      dashboard.routeRanking.value
    )
  })

  it('renders the error state when dashboard loading fails', () => {
    mockDashboard.useDashboard.mockReturnValue(
      createDashboardState({
        state: ref('error'),
        errorMessage: ref('Grafana timeout'),
      })
    )

    const wrapper = mount(StatisticsPage, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('统计数据加载失败')
    expect(wrapper.text()).toContain('Grafana timeout')
  })

  it('renders the empty state when the current filters return no data', () => {
    mockDashboard.useDashboard.mockReturnValue(
      createDashboardState({
        state: ref('empty'),
        consumerRanking: ref([]),
        modelRanking: ref([]),
        routeRanking: ref([]),
        trendSeries: ref([]),
        insights: ref([]),
      })
    )

    const wrapper = mount(StatisticsPage, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('当前筛选暂无数据')
  })
})