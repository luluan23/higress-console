import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import ProviderDrawer from '@/views/ai/provider/ProviderDrawer.vue'
import { createProviderForm } from '@/views/ai/provider/providerModel'

describe('ProviderDrawer', () => {
  it('shows advanced failover fields for qwen providers when failover is enabled', async () => {
    const form = createProviderForm()
    form.type = 'qwen'
    form.tokens = ['token-1', 'token-2']
    form.failoverEnabled = true

    const wrapper = mount(ProviderDrawer, {
      props: {
        visible: true,
        mode: 'create',
        modelValue: form,
        saving: false,
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    await nextTick()

    expect(wrapper.text()).toContain('失败阈值')
    expect(wrapper.text()).toContain('健康检查模型')
  })
})