import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { reactive, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

const mockDashboard = vi.hoisted(() => ({
  useDashboard: vi.fn(() => ({
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
    refresh: vi.fn(),
    resetFilters: vi.fn(),
    patchFilters: vi.fn(),
    applyDrilldown: vi.fn(),
  })),
}))

vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    dispose: vi.fn(),
  })),
}))

vi.mock('@/views/ai/statistics/useAiStatisticsDashboard', () => ({
  useAiStatisticsDashboard: mockDashboard.useDashboard,
}))

import StatisticsPage from '@/views/ai/statistics/index.vue'

describe('AI statistics page', () => {
  it('renders the statistics dashboard shell with drill-down content', () => {
    const wrapper = mount(StatisticsPage, {
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('统计看板')
    expect(wrapper.text()).toContain('查看原始监控')
    expect(wrapper.text()).toContain('KEY_USER_1')
    expect(wrapper.text()).toContain('deepseek-v4-flash')
  })
})