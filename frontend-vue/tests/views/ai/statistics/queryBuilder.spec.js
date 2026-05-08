import { describe, expect, it } from 'vitest'
import {
  buildAverageQuery,
  buildGroupedIncreaseQuery,
  buildPrometheusSelector,
  buildTrendQuery,
  createDefaultFilters,
} from '@/views/ai/statistics/queryBuilder'
import { METRICS } from '@/views/ai/statistics/metricCatalog'

describe('statistics query builder', () => {
  it('builds Prometheus selectors from consumer, model, and route filters', () => {
    const selector = buildPrometheusSelector({
      consumers: ['KEY_USER_1', 'KEY_USER_2'],
      models: ['deepseek-v4-flash'],
      routes: ['ai-route-ksyun.internal'],
    })

    expect(selector).toBe(
      '{ai_consumer=~"KEY_USER_1|KEY_USER_2",ai_model=~"deepseek-v4-flash",ai_route=~"ai-route-ksyun\\.internal"}'
    )
  })

  it('creates a grouped increase query for ranking tables', () => {
    expect(
      buildGroupedIncreaseQuery({
        refId: 'A',
        metric: METRICS.totalToken,
        groupBy: 'ai_consumer',
        filters: createDefaultFilters(),
        rangeToken: '$__range',
      })
    ).toEqual({
      refId: 'A',
      expr: 'sum by(ai_consumer) (increase(route_upstream_model_consumer_metric_total_token{}[$__range]))',
      format: 'table',
      instant: true,
      range: false,
    })
  })

  it('creates average duration queries by dividing duration by request count', () => {
    expect(
      buildAverageQuery({
        refId: 'C',
        numeratorMetric: METRICS.firstTokenDuration,
        denominatorMetric: METRICS.requestCount,
        filters: createDefaultFilters(),
        rangeToken: '$__range',
      }).expr
    ).toBe(
      'sum(increase(route_upstream_model_consumer_metric_llm_first_token_duration{}[$__range])) / clamp_min(sum(increase(route_upstream_model_consumer_metric_llm_duration_count{}[$__range])), 1)'
    )
  })

  it('creates time series queries for usage trends', () => {
    expect(
      buildTrendQuery({
        refId: 'D',
        metric: METRICS.totalToken,
        filters: createDefaultFilters(),
        rangeToken: '$__range',
      })
    ).toEqual({
      refId: 'D',
      expr: 'sum(increase(route_upstream_model_consumer_metric_total_token{}[$__range]))',
      format: 'time_series',
      instant: false,
      range: true,
    })
  })
})