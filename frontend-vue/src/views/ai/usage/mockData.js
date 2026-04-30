const MODELS = ['GPT-4o', 'GPT-3.5', 'Claude-3', 'Gemini-1.5', 'DeepSeek']
const COLORS = ['#0052d9', '#00a870', '#ed7b2f', '#7b4fb3', '#e34d59']

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getUsageMock({ startDate, endDate, models = [] } = {}) {
  const filteredModels = models.length ? models : MODELS
  const dayCount = (() => {
    if (startDate && endDate) {
      const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      return Math.max(1, Math.ceil(diff) + 1)
    }
    return 7
  })()

  const days = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (dayCount - 1 - i))
    return `${d.getMonth() + 1}/${d.getDate()}`
  })

  // Summary stats
  const totalCalls = rand(500, 5000)
  const totalTokens = totalCalls * rand(200, 800)
  const avgLatency = rand(200, 1200)

  // Trend chart (line)
  const trendChart = {
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value' },
    tooltip: { trigger: 'axis' },
    legend: { data: filteredModels },
    series: filteredModels.map((model, i) => ({
      name: model,
      type: 'line',
      smooth: true,
      data: days.map(() => rand(20, 300)),
      itemStyle: { color: COLORS[i % COLORS.length] },
    })),
  }

  // Detail records (paginated, 50 total)
  const records = Array.from({ length: 50 }, (_, i) => {
    const model = filteredModels[i % filteredModels.length]
    return {
      id: i + 1,
      time: new Date(Date.now() - i * 60000 * rand(1, 60)).toLocaleString(),
      model,
      inputTokens: rand(50, 2000),
      outputTokens: rand(20, 800),
      latency: rand(100, 3000),
      status: rand(0, 10) > 1 ? 'success' : 'error',
    }
  })

  return { totalCalls, totalTokens, avgLatency, trendChart, records }
}
