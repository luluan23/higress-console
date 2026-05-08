import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import Sidebar from '@/layout/components/sidebar/index.vue'
import { useAppStore } from '@/stores'

describe('AppSidebar', () => {
  it('keeps the standard menu layout on ai-console routes', () => {
    const pinia = createPinia()
    const appStore = useAppStore(pinia)

    appStore.permissionRoutes = [{ path: '/service', meta: { title: 'Service' } }]
    appStore.openMenuIndex = []
    appStore.sidebar.opened = true

    const wrapper = mount(Sidebar, {
      global: {
        plugins: [pinia],
        mocks: {
          $route: {
            path: '/ai/route',
            meta: { layoutVariant: 'ai-console' },
          },
        },
        stubs: {
          Logo: {
            props: ['collapse'],
            template: '<div class="logo-stub" />',
          },
          SidebarItem: {
            props: ['item', 'basePath'],
            template: '<div class="sidebar-item-stub" />',
          },
          'el-scrollbar': {
            template: '<div class="el-scrollbar-stub"><slot /></div>',
          },
          'el-menu': {
            template: '<div class="el-menu-stub"><slot /></div>',
          },
        },
      },
    })

    expect(wrapper.find('.ai-sidebar-nav').exists()).toBe(false)
    expect(wrapper.find('.el-scrollbar-stub').exists()).toBe(true)
    expect(wrapper.find('.el-menu-stub').exists()).toBe(true)
  })
})