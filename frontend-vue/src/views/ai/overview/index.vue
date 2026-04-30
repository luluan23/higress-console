<template>
  <div class="overview-page">
    <div class="overview-page__header">
      <h2 class="overview-page__title">系统概览</h2>
    </div>

    <!-- 5 Stat cards -->
    <div class="stat-grid">
      <StatCard
        label="总 Token 消耗"
        :value="mock.stats.totalTokens.toLocaleString()"
        unit="tokens"
        color="var(--color-blue)"
      />
      <StatCard
        label="活跃消费者"
        :value="mock.stats.activeConsumers"
        color="var(--color-green)"
      />
      <StatCard
        label="AI 路由数"
        :value="mock.stats.aiRoutes"
        color="var(--color-purple)"
      />
      <StatCard
        label="Provider 数"
        :value="mock.stats.providers"
        color="var(--color-amber)"
        :sub="`${mock.stats.providerErrors} 个异常`"
      />
      <StatCard
        label="平均响应时间"
        :value="mock.stats.avgLatency"
        unit="ms"
        color="var(--color-red)"
      />
    </div>

    <!-- Stacked bar + consumer ranking -->
    <div class="chart-row">
      <div class="chart-card chart-card--wide">
        <div class="chart-card__title">7 日 Token 消耗（按模型）</div>
        <StackedBarChart :option="mock.stackedBar" style="height: 260px" />
      </div>
      <div class="chart-card">
        <div class="chart-card__title">消费者 Token 排行 (Top 5)</div>
        <t-table
          :data="mock.consumerRanking"
          :columns="rankingColumns"
          row-key="rank"
          size="small"
          :bordered="false"
        />
      </div>
    </div>

    <!-- Quota bars + route status -->
    <div class="chart-row">
      <div class="chart-card">
        <div class="chart-card__title">消费者额度使用率</div>
        <div class="quota-list">
          <div v-for="item in mock.quotaUsage" :key="item.name" class="quota-item">
            <div class="quota-item__header">
              <span class="quota-item__name">{{ item.name }}</span>
              <span class="quota-item__pct" :style="{ color: quotaColor(item.used) }">{{ item.used }}%</span>
            </div>
            <div class="quota-item__track">
              <div
                class="quota-item__fill"
                :style="{ width: `${item.used}%`, background: quotaColor(item.used) }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-card chart-card--wide">
        <div class="chart-card__title">AI 路由状态</div>
        <t-table
          :data="mock.routeStatus"
          :columns="routeColumns"
          row-key="name"
          size="small"
          :bordered="false"
        >
          <template #routeStatus="{ row }">
            <t-tag :theme="row.status === 'healthy' ? 'success' : 'warning'" variant="light" size="small">
              {{ row.status === 'healthy' ? '正常' : '告警' }}
            </t-tag>
          </template>
        </t-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getOverviewMock } from './mockData'
import StatCard from '@/components/common/StatCard.vue'
import StackedBarChart from '@/components/charts/StackedBarChart.vue'

export default {
  name: 'OverviewPage',
  components: { StatCard, StackedBarChart },
  data() {
    return {
      mock: getOverviewMock(),
      rankingColumns: [
        { colKey: 'rank', title: '排名', width: 60 },
        { colKey: 'name', title: '消费者' },
        { colKey: 'tokens', title: 'Token 消耗', cell: (h, { row }) => row.tokens.toLocaleString() },
      ],
      routeColumns: [
        { colKey: 'name', title: '路由名称' },
        { colKey: 'provider', title: 'Provider' },
        { colKey: 'requests', title: '请求数' },
        { colKey: 'errors', title: '错误数' },
        { colKey: 'routeStatus', title: '状态', cell: 'routeStatus' },
      ],
    }
  },
  methods: {
    quotaColor(pct) {
      if (pct < 50) return 'var(--color-green, #00a870)'
      if (pct <= 80) return 'var(--color-blue, #0052d9)'
      return pct > 90 ? 'var(--color-red, #e34d59)' : 'var(--color-amber, #ed7b2f)'
    },
  },
}
</script>

<style lang="scss" scoped>
.overview-page {
  padding: 24px;
  background: var(--bg-0, #f5f6fa);
  min-height: 100%;

  &__header {
    display: flex;
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
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 20px;
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

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1a1f2e);
    margin-bottom: 12px;
  }
}

.quota-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quota-item {
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  &__name {
    font-size: 13px;
    color: var(--text-secondary, #4a5568);
  }

  &__pct {
    font-size: 12px;
    font-weight: 600;
  }

  &__track {
    height: 6px;
    background: var(--bg-2, #eef0f6);
    border-radius: 3px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }
}
</style>
