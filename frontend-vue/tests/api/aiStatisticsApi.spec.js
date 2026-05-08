import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request } = vi.hoisted(() => ({
  request: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('@/utils/request', () => ({
  default: request,
}))

import {
  getAiDashboardInfo,
  getGrafanaDashboard,
  queryGrafanaDatasource,
} from '@/api/aiStatisticsApi'

describe('aiStatisticsApi', () => {
  beforeEach(() => {
    request.mockClear()
  })

  it('loads AI dashboard metadata through /dashboard/info', async () => {
    await getAiDashboardInfo()

    expect(request).toHaveBeenCalledWith({
      url: '/dashboard/info',
      method: 'GET',
      params: { type: 'AI' },
    })
  })

  it('loads the Grafana dashboard payload by uid', async () => {
    await getGrafanaDashboard('ai-dashboard-uid')

    expect(request).toHaveBeenCalledWith({
      url: '/grafana/api/dashboards/uid/ai-dashboard-uid',
      method: 'GET',
    })
  })

  it('posts Grafana datasource queries with the resolved datasource uid', async () => {
    await queryGrafanaDatasource({
      dataSourceUid: 'prom-main',
      from: 'now-7d',
      to: 'now',
      queries: [
        {
          refId: 'A',
          expr: 'sum(increase(route_upstream_model_consumer_metric_total_token{}[$__range]))',
          format: 'table',
          instant: true,
          range: false,
        },
      ],
    })

    expect(request).toHaveBeenCalledWith({
      url: '/grafana/api/ds/query',
      method: 'POST',
      data: {
        from: 'now-7d',
        to: 'now',
        queries: [
          {
            refId: 'A',
            expr: 'sum(increase(route_upstream_model_consumer_metric_total_token{}[$__range]))',
            format: 'table',
            instant: true,
            range: false,
            datasource: { type: 'prometheus', uid: 'prom-main' },
          },
        ],
      },
    })
  })
})