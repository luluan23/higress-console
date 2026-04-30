<template>
  <div class="usage-page">
    <div class="usage-page__header">
      <h2 class="usage-page__title">用量明细</h2>
      <div class="usage-page__filters">
        <t-date-range-picker
          v-model="dateRange"
          style="width: 280px"
          @change="refresh"
        />
        <t-select
          v-model="selectedModels"
          multiple
          placeholder="全部模型"
          style="width: 240px"
          @change="refresh"
        >
          <t-option v-for="m in allModels" :key="m" :value="m" :label="m" />
        </t-select>
      </div>
    </div>

    <!-- Summary stat cards -->
    <div class="stat-grid">
      <StatCard
        label="总调用次数"
        :value="mock.totalCalls.toLocaleString()"
        color="var(--color-blue)"
      />
      <StatCard
        label="总 Token 数"
        :value="mock.totalTokens.toLocaleString()"
        unit="tokens"
        color="var(--color-purple)"
      />
      <StatCard
        label="均值延迟"
        :value="mock.avgLatency"
        unit="ms"
        color="var(--color-amber)"
      />
    </div>

    <!-- Trend chart -->
    <div class="chart-card">
      <div class="chart-card__title">调用趋势</div>
      <LineChart :option="mock.trendChart" style="height: 240px" />
    </div>

    <!-- Detail table -->
    <div class="chart-card">
      <div class="chart-card__title">调用明细</div>
      <t-table
        :data="pagedRecords"
        :columns="columns"
        row-key="id"
        stripe
        hover
      >
        <template #status="{ row }">
          <t-tag :theme="row.status === 'success' ? 'success' : 'danger'" variant="light" size="small">
            {{ row.status === 'success' ? '成功' : '失败' }}
          </t-tag>
        </template>
      </t-table>
      <div class="pagination-wrap">
        <t-pagination
          v-model="currentPage"
          :total="mock.records.length"
          :page-size="pageSize"
          show-jumper
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getUsageMock } from './mockData'
import StatCard from '@/components/common/StatCard.vue'
import LineChart from '@/components/charts/LineChart.vue'

const ALL_MODELS = ['GPT-4o', 'GPT-3.5', 'Claude-3', 'Gemini-1.5', 'DeepSeek']

export default {
  name: 'UsagePage',
  components: { StatCard, LineChart },
  data() {
    return {
      dateRange: [],
      selectedModels: [],
      mock: getUsageMock(),
      allModels: ALL_MODELS,
      currentPage: 1,
      pageSize: 10,
      columns: [
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
    pagedRecords() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.mock.records.slice(start, start + this.pageSize)
    },
  },
  methods: {
    refresh() {
      this.currentPage = 1
      const [start, end] = this.dateRange || []
      this.mock = getUsageMock({
        startDate: start,
        endDate: end,
        models: this.selectedModels,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.usage-page {
  padding: 24px;
  background: var(--bg-0, #f5f6fa);
  min-height: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary, #1a1f2e);
    margin: 0;
  }

  &__filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--bg-border, #dde1ea);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1a1f2e);
    margin-bottom: 12px;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
