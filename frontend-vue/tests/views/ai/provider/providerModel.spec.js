import { describe, expect, it } from 'vitest'
import {
  createProviderForm,
  getTokenModeLabel,
  toProviderPayload,
  validateProviderForm,
} from '@/views/ai/provider/providerModel'

describe('providerModel', () => {
  it('removes the failover block when failover is disabled', () => {
    const form = createProviderForm()
    form.name = 'qwen-prod'
    form.type = 'qwen'
    form.protocol = 'openai/v1'
    form.tokens = ['token-1']

    const payload = toProviderPayload(form)

    expect(payload).toEqual({
      name: 'qwen-prod',
      type: 'qwen',
      protocol: 'openai/v1',
      proxyName: '',
      tokens: ['token-1'],
      rawConfigs: {},
    })
  })

  it('labels multiple tokens with failover enabled as Failover 备份', () => {
    expect(
      getTokenModeLabel({
        tokens: ['token-1', 'token-2'],
        tokenFailoverConfig: { enabled: true },
      })
    ).toBe('Failover 备份')
  })

  it('returns a validation error when provider name is empty', () => {
    const form = createProviderForm()
    form.tokens = ['token-1']

    expect(validateProviderForm(form)).toContain('请输入 Provider 名称')
  })
})