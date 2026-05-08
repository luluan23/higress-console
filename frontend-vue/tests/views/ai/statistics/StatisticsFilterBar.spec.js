import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import StatisticsFilterBar from '@/components/ai/statistics/StatisticsFilterBar.vue'

describe('StatisticsFilterBar', () => {
  it('emits refresh and reset actions', async () => {
    const wrapper = mount(StatisticsFilterBar, {
      props: {
        filters: {
          timeRange: { from: 'now-7d', to: 'now', preset: '7d' },
          granularity: 'day',
          consumers: [],
          models: [],
          routes: [],
        },
        options: {
          consumers: ['KEY_USER_1'],
          models: ['deepseek-v4-flash'],
          routes: ['route-ai'],
        },
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find('[data-testid="refresh-statistics"]').trigger('click')
    await wrapper.find('[data-testid="reset-statistics"]').trigger('click')

    expect(wrapper.emitted('refresh')).toHaveLength(1)
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })
})