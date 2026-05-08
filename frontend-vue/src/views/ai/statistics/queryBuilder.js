import { DEFAULT_FILTERS } from './metricCatalog'

function buildMatcher(key, values) {
  if (!values?.length) {
    return ''
  }

  return `${key}=~"${values.join('|')}"`
}

export function createDefaultFilters() {
  return JSON.parse(JSON.stringify(DEFAULT_FILTERS))
}

export function buildPrometheusSelector(filters) {
  const parts = [
    buildMatcher('ai_consumer', filters.consumers),
    buildMatcher('ai_model', filters.models),
    buildMatcher('ai_route', filters.routes),
  ].filter(Boolean)

  return `{${parts.join(',')}}`
}

export function buildGroupedIncreaseQuery({ refId, metric, groupBy, filters, rangeToken }) {
  const selector = buildPrometheusSelector(filters)

  return {
    refId,
    expr: `sum by(${groupBy}) (increase(${metric}${selector}[${rangeToken}]))`,
    format: 'table',
    instant: true,
    range: false,
  }
}

export function buildAverageQuery({
  refId,
  numeratorMetric,
  denominatorMetric,
  filters,
  rangeToken,
}) {
  const selector = buildPrometheusSelector(filters)

  return {
    refId,
    expr: `sum(increase(${numeratorMetric}${selector}[${rangeToken}])) / clamp_min(sum(increase(${denominatorMetric}${selector}[${rangeToken}])), 1)`,
    format: 'table',
    instant: true,
    range: false,
  }
}

export function buildTrendQuery({ refId, metric, filters, rangeToken }) {
  const selector = buildPrometheusSelector(filters)

  return {
    refId,
    expr: `sum(increase(${metric}${selector}[${rangeToken}]))`,
    format: 'time_series',
    instant: false,
    range: true,
  }
}