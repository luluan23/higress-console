import { config } from '@vue/test-utils'
import { vi } from 'vitest'

window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('vue-clipboard3', () => ({
  default: () => ({
    toClipboard: vi.fn(),
  }),
}))

config.global.stubs = {
  transition: false,
  'router-link': {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>',
  },
  'router-view': true,
}