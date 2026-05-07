export function createRouteForm() {
  return {
    name: '',
    version: '',
    domains: [''],
    pathPredicate: { matchType: 'PRE', matchValue: '/', caseSensitive: false },
    upstreams: [{ provider: '', weight: 100, modelMappingRows: [] }],
    authEnabled: false,
    allowedConsumers: [],
    fallbackEnabled: false,
    fallbackStrategy: 'RAND',
    fallbackUpstreams: [],
    fallbackResponseCodes: [],
  }
}

export function routeFromApi(route) {
  return {
    name: route.name || '',
    version: route.version || '',
    domains: route.domains?.length ? [...route.domains] : [''],
    pathPredicate: route.pathPredicate || {
      matchType: 'PRE',
      matchValue: '/',
      caseSensitive: false,
    },
    upstreams: (route.upstreams || []).map((upstream) => ({
      provider: upstream.provider,
      weight: upstream.weight,
      modelMappingRows: Object.entries(upstream.modelMapping || {}).map(([source, target]) => ({
        source,
        target,
      })),
    })),
    authEnabled: route.authConfig?.enabled || false,
    allowedConsumers: route.authConfig?.allowedConsumers || [],
    fallbackEnabled: route.fallbackConfig?.enabled || false,
    fallbackStrategy: route.fallbackConfig?.fallbackStrategy || 'RAND',
    fallbackUpstreams: route.fallbackConfig?.upstreams || [],
    fallbackResponseCodes: route.fallbackConfig?.responseCodes || [],
  }
}

export function validateRouteForm(form) {
  const errors = []

  if (!form.name.trim()) {
    errors.push('请输入路由名称')
  }

  if (!form.domains.map((item) => item.trim()).filter(Boolean).length) {
    errors.push('至少填写一个域名')
  }

  if (!form.upstreams.length) {
    errors.push('至少配置一个上游 Provider')
  }

  if (form.authEnabled && !form.allowedConsumers.length) {
    errors.push('请选择允许访问的消费者')
  }

  if (
    form.fallbackEnabled &&
    form.fallbackStrategy === 'SEQ' &&
    form.fallbackUpstreams.length > 1
  ) {
    errors.push('SEQ 模式下只允许一个 Fallback Upstream')
  }

  return errors
}

export function toRoutePayload(form) {
  return {
    ...(form.version ? { version: form.version } : {}),
    name: form.name.trim(),
    domains: form.domains.map((item) => item.trim()).filter(Boolean),
    pathPredicate: form.pathPredicate,
    upstreams: form.upstreams.map((upstream) => ({
      provider: upstream.provider,
      weight: Number(upstream.weight),
      modelMapping: upstream.modelMappingRows.reduce((result, row) => {
        if (row.source && row.target) {
          result[row.source] = row.target
        }

        return result
      }, {}),
    })),
    authConfig: {
      enabled: form.authEnabled,
      allowedConsumers: form.allowedConsumers,
    },
    fallbackConfig: {
      enabled: form.fallbackEnabled,
      fallbackStrategy: form.fallbackStrategy,
      upstreams: form.fallbackUpstreams,
      responseCodes: form.fallbackResponseCodes,
    },
  }
}