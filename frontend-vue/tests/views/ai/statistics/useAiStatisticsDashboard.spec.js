import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import {
  dashboardFixture,
  routeTableResponseFixture,
  tableResponseFixture,
  trendResponseFixture,
} from './fixtures'

const api = vi.hoisted(() => ({
  getAiDashboardInfo: vi.fn(() => Promise.resolve({ data: { uid: 'ai-dashboard-uid', url: '/grafana/d/ai' } })),
  getGrafanaDashboard: vi.fn(() => Promise.resolve(dashboardFixture)),
  queryGrafanaDatasource: vi.fn(({ queries }) => {
    const query = queries[0]

    if (query.format === 'time_series') {
      return Promise.resolve(trendResponseFixture)
    }

    if (query.expr.includes('sum by(ai_route)')) {
      return Promise.resolve(routeTableResponseFixture)
    }

    if (query.expr.includes('llm_first_token_duration')) {
      return Promise.resolve({
        results: {
          A: {
            frames: [
              {
                schema: { fields: [{ name: 'Value' }] },
                data: { values: [[5255]] },
              },
            ],
          },
        },
      })
    }

    return Promise.resolve(tableResponseFixture)
  }),
}))

vi.mock('@/api/aiStatisticsApi', () => api)

import { useAiStatisticsDashboard } from '@/views/ai/statistics/useAiStatisticsDashboard'

const Harness = {
  template: '<div />',
  setup() {
    return useAiStatisticsDashboard()
  },
}

describe('useAiStatisticsDashboard', () => {
  it('loads dashboard data and exposes KPI and ranking state', async () => {
    const wrapper = mount(Harness)

    await flushPromises()

    expect(api.getAiDashboardInfo).toHaveBeenCalled()
    expect(api.getGrafanaDashboard).toHaveBeenCalledWith('ai-dashboard-uid')
    expect(wrapper.vm.dashboardUrl).toBe('/grafana/d/ai')
    expect(wrapper.vm.options.routes).toEqual(['route-ai', 'route-fallback'])
    expect(wrapper.vm.consumerRanking).toEqual([
      { dimension: 'KEY_USER_1', value: 5400 },
      { dimension: 'KEY_USER_2', value: 1200 },
    ])
    expect(wrapper.vm.insights[0]).toContain('KEY_USER_1')
  })

  it('writes drill-down choices back into shared filters', async () => {
    const wrapper = mount(Harness)

    await flushPromises()
    wrapper.vm.applyDrilldown('consumer', 'KEY_USER_1')

    expect(wrapper.vm.filters.consumers).toEqual(['KEY_USER_1'])
  })
})