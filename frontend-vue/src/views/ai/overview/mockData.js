function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const MODELS = ['GPT-4o', 'GPT-3.5', 'Claude-3', 'Gemini-1.5', 'DeepSeek']
const COLORS = ['#0052d9', '#00a870', '#ed7b2f', '#7b4fb3', '#e34d59']

function last7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return days
}

export function getOverviewMock() {
  const days = last7Days()

  // 5 stat cards
  const stats = {
    totalTokens: 12_450_000,
    activeConsumers: 23,
    aiRoutes: 8,
    providers: 5,
    providerErrors: 1,
    avgLatency: 342,
  }

  // Stacked bar chart (per-model breakdown, 7 days)
  const stackedBar = {
    xAxis: { type: 'category', data: days },
    yAxis: { type: 'value' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: MODELS },
    series: MODELS.map((model, i) => ({
      name: model,
      type: 'bar',
      stack: 'total',
      data: days.map(() => rand(10000, 80000)),
      itemStyle: { color: COLORS[i] },
    })),
  }

  // Consumer token ranking (Top 5)
  const consumerRanking = [
    { rank: 1, name: 'app-alpha', tokens: 2_100_000 },
    { rank: 2, name: 'app-beta', tokens: 1_800_000 },
    { rank: 3, name: 'app-gamma', tokens: 1_300_000 },
    { rank: 4, name: 'dev-tools', tokens: 900_000 },
    { rank: 5, name: 'test-suite', tokens: 450_000 },
  ]

  // Quota usage (progress bars)
  const quotaUsage = [
    { name: 'app-alpha', used: 84, total: 3_000_000 },
    { name: 'app-beta', used: 62, total: 3_000_000 },
    { name: 'app-gamma', used: 43, total: 3_000_000 },
    { name: 'dev-tools', used: 30, total: 3_000_000 },
    { name: 'test-suite', used: 15, total: 3_000_000 },
  ]

  // Route status table
  const routeStatus = [
    { name: 'openai-route', provider: 'GPT-4o', requests: rand(100, 500), errors: rand(0, 5), status: 'healthy' },
    { name: 'claude-route', provider: 'Claude-3', requests: rand(100, 500), errors: rand(0, 5), status: 'healthy' },
    { name: 'gemini-route', provider: 'Gemini-1.5', requests: rand(50, 300), errors: rand(0, 20), status: 'warning' },
    { name: 'deepseek-route', provider: 'DeepSeek', requests: rand(20, 100), errors: 0, status: 'healthy' },
  ]

  return { stats, stackedBar, consumerRanking, quotaUsage, routeStatus }
}
