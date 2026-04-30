<template>
  <div class="dashboard-page">
    <!-- Header with granularity toggle -->
    <div class="dashboard-page__header">
      <h2 class="dashboard-page__title">仪表盘</h2>
      <t-radio-group v-model="granularity" variant="default-filled" @change="refreshCharts">
        <t-radio-button value="hour">小时</t-radio-button>
        <t-radio-button value="day">日</t-radio-button>
        <t-radio-button value="week">周</t-radio-button>
        <t-radio-button value="month">月</t-radio-button>
      </t-radio-group>
    </div>

    <!-- Stat cards -->
    <div class="stat-grid">
      <StatCard
        label="总 Token 额度"
        :value="mock.totalQuota.toLocaleString()"
        unit="tokens"
        color="var(--color-blue)"
        :progress="mock.usedPct"
        :sub="`已用 ${mock.usedPct}%`"
      />
      <StatCard
        label="已消耗 Token"
        :value="mock.consumed.toLocaleString()"
        unit="tokens"
        color="var(--color-purple)"
        :trend="mock.consumedTrend"
      />
      <StatCard
        label="剩余 Token"
        :value="mock.remaining.toLocaleString()"
        unit="tokens"
        color="var(--color-green)"
        :sub="`预计剩余 ${mock.remainDays} 天`"
      />
      <StatCard
        label="今日调用次数"
        :value="mock.todayCalls.toLocaleString()"
        color="var(--color-amber)"
        :trend="mock.callTrend"
      />
    </div>

    <!-- API endpoint bar -->
    <div class="endpoint-bar">
      <span class="endpoint-bar__label">API 地址：</span>
      <CopyText :text="apiEndpoint" monospace />
    </div>

    <!-- Charts row 1: line + pie -->
    <div class="chart-row">
      <div class="chart-card chart-card--wide">
        <div class="chart-card__title">Token 用量趋势</div>
        <LineChart :option="chartData.tokenTrend" style="height: 260px" />
      </div>
      <div class="chart-card">
        <div class="chart-card__title">调用分布</div>
        <PieChart :option="chartData.callDist" style="height: 260px" />
      </div>
    </div>

    <!-- Charts row 2: bar + table -->
    <div class="chart-row">
      <div class="chart-card">
        <div class="chart-card__title">调用量</div>
        <BarChart :option="chartData.callBar" style="height: 220px" />
      </div>
      <div class="chart-card chart-card--wide">
        <div class="chart-card__title">最近调用记录</div>
        <t-table
          :data="chartData.records.slice(0, 8)"
          :columns="recordColumns"
          row-key="id"
          size="small"
          :bordered="false"
        >
          <template #status="{ row }">
            <t-tag :theme="row.status === 'success' ? 'success' : 'danger'" variant="light" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </t-tag>
          </template>
        </t-table>
      </div>
    </div>
  </div>
</template>

<script>
import { useAiStore } from '@/stores/modules/aiStore'
import { getDashboardMock } from './mockData'
import StatCard from '@/components/common/StatCard.vue'
import CopyText from '@/components/common/CopyText.vue'
import LineChart from '@/components/charts/LineChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'

export default {
  name: 'DashboardPage',
  components: { StatCard, CopyText, LineChart, PieChart, BarChart },
  data() {
    return {
      granularity: 'day',
      chartData: getDashboardMock('day'),
      mock: {
        totalQuota: 5000000,
        consumed: 1230000,
        usedPct: 25,
        consumedTrend: 12,
        remaining: 3770000,
        remainDays: 42,
        todayCalls: 3842,
        callTrend: -5,
      },
      recordColumns: [
        { colKey: 'time', title: '时间', width: 160 },
        { colKey: 'model', title: '模型' },
        { colKey: 'inputTokens', title: '输入 Token' },
        { colKey: 'outputTokens', title: '输出 Token' },
        { colKey: 'latency', title: '延迟 (ms)' },
        { colKey: 'status', title: '状态', cell: 'status' },
      ],
    }
  },
  computed: {
    aiStore() { return useAiStore() },
    apiEndpoint() {
      const firstRoute = this.aiStore.routes[0]
      const domain = firstRoute?.domains?.[0] || 'your-gateway.example.com'
      return `https://${domain}/v1/chat/completions`
    },
  },
  created() {
    this.aiStore.fetchRoutes()
  },
  methods: {
    refreshCharts(val) {
      this.chartData = getDashboardMock(val)
    },
  },
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 24px;
  background: var(--bg-0, #f5f6fa);
  min-height: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary, #1a1f2e);
    margin: 0;
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.endpoint-bar {
  display: flex;
  align-items: center;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--bg-border, #dde1ea);
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 20px;
  font-size: 13px;

  &__label {
    color: var(--text-muted, #8896a9);
    margin-right: 8px;
    flex-shrink: 0;
  }
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--bg-border, #dde1ea);
  border-radius: 8px;
  padding: 16px;

  &--wide {
    grid-column: span 1;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1a1f2e);
    margin-bottom: 12px;
  }
}
</style>
