function flattenPanels(panels = []) {
  return panels.flatMap((panel) => [panel, ...(panel.panels ? flattenPanels(panel.panels) : [])])
}

export function parsePrometheusDatasourceUid(payload) {
  const panels = flattenPanels(payload?.dashboard?.panels || [])

  for (const panel of panels) {
    if (panel.datasource?.type === 'prometheus' && panel.datasource?.uid) {
      return panel.datasource.uid
    }

    for (const target of panel.targets || []) {
      if (target.datasource?.type === 'prometheus' && target.datasource?.uid) {
        return target.datasource.uid
      }
    }
  }

  return ''
}

export function normalizeTableRows(payload, dimensionField) {
  const frame = payload?.results?.A?.frames?.[0]
  const fieldNames = frame?.schema?.fields?.map((field) => field.name) || []
  const dimensionIndex = fieldNames.indexOf(dimensionField)
  const valueIndex = fieldNames.indexOf('Value')
  const dimensionValues = frame?.data?.values?.[dimensionIndex] || []
  const numericValues = frame?.data?.values?.[valueIndex] || []

  return dimensionValues.map((dimension, index) => ({
    dimension,
    value: Number(numericValues[index] || 0),
  }))
}

export function normalizeTrendSeries(payload) {
  const frame = payload?.results?.A?.frames?.[0]
  const fieldNames = frame?.schema?.fields?.map((field) => field.name) || []
  const timeIndex = fieldNames.indexOf('Time')
  const valueIndex = fieldNames.indexOf('Value')
  const timestamps = frame?.data?.values?.[timeIndex] || []
  const values = frame?.data?.values?.[valueIndex] || []

  return timestamps.map((timestamp, index) => ({
    timestamp,
    value: Number(values[index] || 0),
  }))
}

export function normalizeFirstValue(payload) {
  const frame = payload?.results?.A?.frames?.[0]
  const fieldNames = frame?.schema?.fields?.map((field) => field.name) || []
  const valueIndex = fieldNames.indexOf('Value')
  const values = frame?.data?.values?.[valueIndex] || []

  return Number(values[0] || 0)
}

export function buildInsights({ consumerRanking, modelRanking, averageFirstToken }) {
  const insights = []

  if (consumerRanking[0]) {
    insights.push(`消费者 ${consumerRanking[0].dimension} 贡献了当前窗口内最高 Token 消耗。`)
  }

  if (modelRanking[0]) {
    insights.push(`模型 ${modelRanking[0].dimension} 是当前窗口内最活跃的模型。`)
  }

  insights.push(
    `平均首 Token 时延为 ${averageFirstToken}，需结合 Grafana 原始监控继续确认波动来源。`
  )

  return insights
}