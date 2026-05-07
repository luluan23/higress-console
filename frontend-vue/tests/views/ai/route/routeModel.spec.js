import { describe, expect, it } from 'vitest'
import {
  createRouteForm,
  toRoutePayload,
  validateRouteForm,
} from '@/views/ai/route/routeModel'

describe('routeModel', () => {
  it('converts model mapping rows to an object payload', () => {
    const form = createRouteForm()
    form.name = 'chat-route'
    form.domains = ['chat.example.com']
    form.upstreams = [
      {
        provider: 'qwen-prod',
        weight: 100,
        modelMappingRows: [{ source: 'gpt-4o', target: 'qwen-max' }],
      },
    ]

    expect(toRoutePayload(form)).toEqual({
      name: 'chat-route',
      domains: ['chat.example.com'],
      pathPredicate: { matchType: 'PRE', matchValue: '/', caseSensitive: false },
      upstreams: [
        {
          provider: 'qwen-prod',
          weight: 100,
          modelMapping: { 'gpt-4o': 'qwen-max' },
        },
      ],
      authConfig: { enabled: false, allowedConsumers: [] },
      fallbackConfig: {
        enabled: false,
        fallbackStrategy: 'RAND',
        upstreams: [],
        responseCodes: [],
      },
    })
  })

  it('returns a validation error when auth is enabled without allowed consumers', () => {
    const form = createRouteForm()
    form.authEnabled = true

    expect(validateRouteForm(form)).toContain('请选择允许访问的消费者')
  })
})