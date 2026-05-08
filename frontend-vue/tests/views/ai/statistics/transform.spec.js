import { describe, expect, it } from 'vitest'
import {
  dashboardFixture,
  tableResponseFixture,
  trendResponseFixture,
} from './fixtures'
import {
  buildInsights,
  normalizeFirstValue,
  normalizeTableRows,
  normalizeTrendSeries,
  parsePrometheusDatasourceUid,
} from '@/views/ai/statistics/transform'

describe('statistics transform helpers', () => {
  it('extracts the first Prometheus datasource uid from the Grafana dashboard payload', () => {
    expect(parsePrometheusDatasourceUid(dashboardFixture)).toBe('prom-main')
  })

  it('normalizes Grafana table responses into dimension-value rows', () => {
    expect(normalizeTableRows(tableResponseFixture, 'ai_consumer')).toEqual([
      { dimension: 'KEY_USER_1', value: 5400 },
      { dimension: 'KEY_USER_2', value: 1200 },
    ])
  })

  it('normalizes Grafana trend frames into timestamp/value points', () => {
    expect(normalizeTrendSeries(trendResponseFixture)).toEqual([
      { timestamp: 1715126400000, value: 3200 },
      { timestamp: 1715212800000, value: 4100 },
    ])
  })

  it('extracts single-value table results for KPI math', () => {
    expect(
      normalizeFirstValue({
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
    ).toBe(5255)
  })

  it('builds human-readable insight strings from ranking and latency data', () => {
    expect(
      buildInsights({
        consumerRanking: [
          { dimension: 'KEY_USER_1', value: 5400 },
          { dimension: 'KEY_USER_2', value: 1200 },
        ],
        modelRanking: [{ dimension: 'deepseek-v4-flash', value: 6600 }],
        averageFirstToken: 5255,
      })
    ).toEqual([
      '消费者 KEY_USER_1 贡献了当前窗口内最高 Token 消耗。',
      '模型 deepseek-v4-flash 是当前窗口内最活跃的模型。',
      '平均首 Token 时延为 5255，需结合 Grafana 原始监控继续确认波动来源。',
    ])
  })
})