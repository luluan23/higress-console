export function createProviderForm() {
  return {
    name: '',
    version: '',
    type: 'qwen',
    protocol: 'openai/v1',
    proxyName: '',
    tokens: [''],
    failoverEnabled: false,
    failureThreshold: 3,
    successThreshold: 1,
    healthCheckInterval: 30,
    healthCheckTimeout: 10,
    healthCheckModel: '',
    rawConfigs: {},
  }
}

export function providerFromApi(provider) {
  return {
    name: provider.name || '',
    version: provider.version || '',
    type: provider.type || 'qwen',
    protocol: provider.protocol || 'openai/v1',
    proxyName: provider.proxyName || '',
    tokens: provider.tokens?.length ? [...provider.tokens] : [''],
    failoverEnabled: provider.tokenFailoverConfig?.enabled || false,
    failureThreshold: provider.tokenFailoverConfig?.failureThreshold ?? 3,
    successThreshold: provider.tokenFailoverConfig?.successThreshold ?? 1,
    healthCheckInterval: provider.tokenFailoverConfig?.healthCheckInterval ?? 30,
    healthCheckTimeout: provider.tokenFailoverConfig?.healthCheckTimeout ?? 10,
    healthCheckModel: provider.tokenFailoverConfig?.healthCheckModel || '',
    rawConfigs: provider.rawConfigs || {},
  }
}

export function validateProviderForm(form) {
  const errors = []

  if (!form.name.trim()) {
    errors.push('请输入 Provider 名称')
  }

  if (!form.type) {
    errors.push('请选择 Provider 类型')
  }

  if (!form.protocol) {
    errors.push('请选择协议')
  }

  if (!form.tokens.map((token) => token.trim()).filter(Boolean).length) {
    errors.push('至少填写一个 Token')
  }

  return errors
}

export function toProviderPayload(form) {
  const payload = {
    name: form.name.trim(),
    type: form.type,
    protocol: form.protocol,
    proxyName: form.proxyName || '',
    tokens: form.tokens.map((token) => token.trim()).filter(Boolean),
    rawConfigs: form.rawConfigs || {},
  }

  if (form.version) {
    payload.version = form.version
  }

  if (form.failoverEnabled) {
    payload.tokenFailoverConfig = {
      enabled: true,
      failureThreshold: Number(form.failureThreshold),
      successThreshold: Number(form.successThreshold),
      healthCheckInterval: Number(form.healthCheckInterval),
      healthCheckTimeout: Number(form.healthCheckTimeout),
      healthCheckModel: form.healthCheckModel,
    }
  }

  return payload
}

export function getTokenModeLabel(provider) {
  const tokenCount = provider.tokens?.length || 0

  if (tokenCount <= 1) {
    return '单 Token'
  }

  return provider.tokenFailoverConfig?.enabled ? 'Failover 备份' : '轮询负载均衡'
}