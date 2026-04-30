const MODELS = ['GPT-4o', 'GPT-3.5', 'Claude-3', 'Gemini-1.5']
const COLORS = ['#0052d9', '#00a870', '#ed7b2f', '#7b4fb3']

function generateDates(count, granularity) {
  const dates = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now)
    if (granularity === 'hour') d.setHours(d.getHours() - i)
    else if (granularity === 'day') d.setDate(d.getDate() - i)
    else if (granularity === 'week') d.setDate(d.getDate() - i * 7)
    else d.setMonth(d.getMonth() - i)
    if (granularity === 'hour') dates.push(`${d.getHours()}:00`)
    else if (granularity === 'month') dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    else dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return dates
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getDashboardMock(granularity = 'day') {
  const countMap = { hour: 24, day: 14, week: 8, month: 6 }
  const count = countMap[granularity] || 14
  const dates = generateDates(count, granularity)

  // Token trend (line chart)
  const tokenTrend = {
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    tooltip: { trigger: 'axis' },
    series: MODELS.map((model, i) => ({
      name: model,
      type: 'line',
      smooth: true,
      data: dates.map(() => rand(5000, 50000)),
      itemStyle: { color: COLORS[i] },
    })),
    legend: { data: MODELS },
  }

  // Call distribution (pie chart)
  const callDist = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: MODELS.map((model, i) => ({
        name: model,
        value: rand(100, 800),
        itemStyle: { color: COLORS[i] },
      })),
    }],
    legend: { orient: 'vertical', right: 10, top: 'middle', data: MODELS },
  }

  // Hourly call count (bar chart)
  const callBar = {
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    tooltip: { trigger: 'axis' },
    series: [{
      type: 'bar',
      data: dates.map(() => rand(20, 200)),
      itemStyle: { color: '#0052d9' },
    }],
  }

  // Recent call records
  const records = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    time: new Date(Date.now() - i * 60000 * rand(1, 30)).toLocaleString(),
    model: MODELS[i % MODELS.length],
    inputTokens: rand(50, 2000),
    outputTokens: rand(50, 1000),
    latency: rand(200, 3000),
    status: rand(0, 10) > 1 ? 'success' : 'error',
  }))

  return { tokenTrend, callDist, callBar, records }
}
