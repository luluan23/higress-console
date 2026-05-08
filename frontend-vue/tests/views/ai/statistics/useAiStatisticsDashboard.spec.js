import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  dashboardFixture,
  routeTableResponseFixture,
  tableResponseFixture,
  trendResponseFixture,
} from './fixtures'

function createLatencyResponse(value = 5255) {
  return {
    results: {
      A: {
        frames: [
          {
            schema: { fields: [{ name: 'Value' }] },
            data: { values: [[value]] },
          },
        ],
      },
    },
  }
}

function createEmptyTableResponse(dimensionField) {
  return {
    results: {
      A: {
        frames: [
          {
            schema: { fields: [{ name: dimensionField }, { name: 'Value' }] },
            data: { values: [[], []] },
          },
        ],
      },
    },
  }
}

function createDeferred() {
  let resolve

  const promise = new Promise((nextResolve) => {
    resolve = nextResolve
  })

  return { promise, resolve }
}

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

beforeEach(() => {
  api.getAiDashboardInfo.mockReset()
  api.getAiDashboardInfo.mockResolvedValue({
    data: { uid: 'ai-dashboard-uid', url: '/grafana/d/ai' },
  })
  api.getGrafanaDashboard.mockReset()
  api.getGrafanaDashboard.mockResolvedValue(dashboardFixture)
  api.queryGrafanaDatasource.mockReset()
  api.queryGrafanaDatasource.mockImplementation(({ queries }) => {
    const query = queries[0]

    if (query.format === 'time_series') {
      return Promise.resolve(trendResponseFixture)
    }

    if (query.expr.includes('sum by(ai_route)')) {
      return Promise.resolve(routeTableResponseFixture)
    }

    if (query.expr.includes('llm_first_token_duration')) {
      return Promise.resolve(createLatencyResponse())
    }

    return Promise.resolve(tableResponseFixture)
  })
})

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

  it('keeps the page ready when partial query results still return route and trend data', async () => {
    api.queryGrafanaDatasource.mockImplementation(({ queries }) => {
      const query = queries[0]

      if (query.format === 'time_series') {
        return Promise.resolve(trendResponseFixture)
      }

      if (query.expr.includes('sum by(ai_route)')) {
        return Promise.resolve(routeTableResponseFixture)
      }

      if (query.expr.includes('llm_first_token_duration')) {
        return Promise.reject(new Error('latency timeout'))
      }

      if (query.expr.includes('sum by(ai_consumer)')) {
        return Promise.resolve(createEmptyTableResponse('ai_consumer'))
      }

      return Promise.resolve(createEmptyTableResponse('ai_model'))
    })

    const wrapper = mount(Harness)

    await flushPromises()

    expect(wrapper.vm.state).toBe('ready')
    expect(wrapper.vm.routeRanking).toEqual([
      { dimension: 'route-ai', value: 4700 },
      { dimension: 'route-fallback', value: 1900 },
    ])
  })

  it('preserves the original filter dictionaries after a filtered refresh', async () => {
    api.queryGrafanaDatasource.mockImplementation(({ queries }) => {
      const query = queries[0]

      if (query.format === 'time_series') {
        return Promise.resolve(trendResponseFixture)
      }

      if (query.expr.includes('sum by(ai_route)')) {
        return Promise.resolve(routeTableResponseFixture)
      }

      if (query.expr.includes('llm_first_token_duration')) {
        return Promise.resolve(createLatencyResponse())
      }

      if (query.expr.includes('ai_consumer=~"KEY_USER_1"')) {
        return Promise.resolve({
          results: {
            A: {
              frames: [
                {
                  schema: { fields: [{ name: 'ai_consumer' }, { name: 'Value' }] },
                  data: { values: [['KEY_USER_1'], [5400]] },
                },
              ],
            },
          },
        })
      }

      return Promise.resolve(tableResponseFixture)
    })

    const wrapper = mount(Harness)

    await flushPromises()
    wrapper.vm.applyDrilldown('consumer', 'KEY_USER_1')
    await wrapper.vm.refresh()
    await flushPromises()

    expect(wrapper.vm.consumerRanking).toEqual([{ dimension: 'KEY_USER_1', value: 5400 }])
    expect(wrapper.vm.options.consumers).toEqual(['KEY_USER_1', 'KEY_USER_2'])
  })

  it('ignores stale not-ready responses after a newer refresh succeeds', async () => {
    const firstDashboardInfo = createDeferred()

    api.getAiDashboardInfo.mockReset()
    api.getAiDashboardInfo
      .mockImplementationOnce(() => firstDashboardInfo.promise)
      .mockResolvedValue({
        data: { uid: 'ai-dashboard-uid', url: '/grafana/d/ai' },
      })

    const wrapper = mount(Harness)

    await wrapper.vm.refresh()
    await flushPromises()

    expect(wrapper.vm.state).toBe('ready')
    expect(wrapper.vm.dashboardUrl).toBe('/grafana/d/ai')

    firstDashboardInfo.resolve({ data: {} })
    await flushPromises()

    expect(wrapper.vm.state).toBe('ready')
    expect(wrapper.vm.dashboardUrl).toBe('/grafana/d/ai')
    expect(wrapper.vm.loading).toBe(false)
  })
})