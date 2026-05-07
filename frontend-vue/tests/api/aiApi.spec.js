import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request } = vi.hoisted(() => ({
  request: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('@/utils/request', () => ({
  default: request,
}))

import { listProviders, updateAiRoute, deleteConsumer } from '@/api/aiApi'

describe('ai api', () => {
  beforeEach(() => {
    request.mockClear()
  })

  it('calls the provider list endpoint with query params', async () => {
    await listProviders({ query: 'qwen' })

    expect(request).toHaveBeenCalledWith({
      url: '/v1/ai/providers',
      method: 'GET',
      params: { query: 'qwen' },
    })
  })

  it('calls the route update endpoint with the route name in the path', async () => {
    const payload = { name: 'chat-route', version: '3' }
    await updateAiRoute(payload)

    expect(request).toHaveBeenCalledWith({
      url: '/v1/ai/routes/chat-route',
      method: 'PUT',
      data: payload,
    })
  })

  it('calls the consumer delete endpoint with the consumer name', async () => {
    await deleteConsumer('mobile-client')

    expect(request).toHaveBeenCalledWith({
      url: '/v1/consumers/mobile-client',
      method: 'DELETE',
    })
  })
})