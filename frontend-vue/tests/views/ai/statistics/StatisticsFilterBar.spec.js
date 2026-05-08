import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import StatisticsFilterBar from '@/components/ai/statistics/StatisticsFilterBar.vue'

function createProps() {
  return {
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
  }
}

describe('StatisticsFilterBar', () => {
  it('emits refresh and reset actions', async () => {
    const wrapper = mount(StatisticsFilterBar, {
      props: createProps(),
      global: {
        plugins: [ElementPlus],
      },
    })

    await wrapper.find('[data-testid="refresh-statistics"]').trigger('click')
    await wrapper.find('[data-testid="reset-statistics"]').trigger('click')

    expect(wrapper.emitted('refresh')).toHaveLength(1)
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })

  it('emits merged filter payloads for time range and selector changes', async () => {
    const wrapper = mount(StatisticsFilterBar, {
      props: createProps(),
      global: {
        plugins: [ElementPlus],
      },
    })

    const selects = wrapper.findAllComponents({ name: 'ElSelect' })

    await selects[0].vm.$emit('change', '30d')
    expect(wrapper.emitted('update:filters')[0][0]).toEqual({
      timeRange: { from: 'now-30d', to: 'now', preset: '30d' },
      granularity: 'day',
      consumers: [],
      models: [],
      routes: [],
    })

    await wrapper.setProps({ filters: wrapper.emitted('update:filters')[0][0] })

    await selects[1].vm.$emit('change', 'hour')
    expect(wrapper.emitted('update:filters')[1][0]).toEqual({
      timeRange: { from: 'now-30d', to: 'now', preset: '30d' },
      granularity: 'hour',
      consumers: [],
      models: [],
      routes: [],
    })

    await wrapper.setProps({ filters: wrapper.emitted('update:filters')[1][0] })

    await selects[2].vm.$emit('change', ['KEY_USER_1'])
    expect(wrapper.emitted('update:filters')[2][0]).toEqual({
      timeRange: { from: 'now-30d', to: 'now', preset: '30d' },
      granularity: 'hour',
      consumers: ['KEY_USER_1'],
      models: [],
      routes: [],
    })

    await wrapper.setProps({ filters: wrapper.emitted('update:filters')[2][0] })

    await selects[3].vm.$emit('change', ['deepseek-v4-flash'])
    expect(wrapper.emitted('update:filters')[3][0]).toEqual({
      timeRange: { from: 'now-30d', to: 'now', preset: '30d' },
      granularity: 'hour',
      consumers: ['KEY_USER_1'],
      models: ['deepseek-v4-flash'],
      routes: [],
    })

    await wrapper.setProps({ filters: wrapper.emitted('update:filters')[3][0] })

    await selects[4].vm.$emit('change', ['route-ai'])
    expect(wrapper.emitted('update:filters')[4][0]).toEqual({
      timeRange: { from: 'now-30d', to: 'now', preset: '30d' },
      granularity: 'hour',
      consumers: ['KEY_USER_1'],
      models: ['deepseek-v4-flash'],
      routes: ['route-ai'],
    })
  })
})