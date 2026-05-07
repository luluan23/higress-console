import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import ConsumerDrawer from '@/views/ai/consumer/ConsumerDrawer.vue'
import { createConsumerForm } from '@/views/ai/consumer/consumerModel'

describe('ConsumerDrawer', () => {
  it('shows query-specific fields when the credential source is QUERY', async () => {
    const form = createConsumerForm()
    form.credentials = [
      {
        type: 'key-auth',
        key: 'secret',
        source: 'QUERY',
        headerName: '',
        queryName: 'api_key',
      },
    ]

    const wrapper = mount(ConsumerDrawer, {
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

    expect(wrapper.find('input[placeholder="Query 参数名"]').exists()).toBe(true)
  })
})