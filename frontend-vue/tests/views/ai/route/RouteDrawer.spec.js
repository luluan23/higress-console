import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import RouteDrawer from '@/views/ai/route/RouteDrawer.vue'
import { createRouteForm } from '@/views/ai/route/routeModel'

describe('RouteDrawer', () => {
  it('shows the fallback section when fallback is enabled', async () => {
    const form = createRouteForm()
    form.fallbackEnabled = true

    const wrapper = mount(RouteDrawer, {
      props: {
        visible: true,
        modelValue: form,
        consumerOptions: ['mobile-client'],
        providerOptions: ['qwen-prod'],
        saving: false,
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    await nextTick()

    expect(wrapper.text()).toContain('Fallback 策略')
    expect(wrapper.text()).toContain('Fallback Upstreams')
  })
})