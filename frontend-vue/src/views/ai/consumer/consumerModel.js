export function createConsumerForm() {
  return {
    name: '',
    version: '',
    credentials: [
      {
        type: 'key-auth',
        key: '',
        source: 'BEARER',
        headerName: '',
        queryName: '',
      },
    ],
  }
}

export function consumerFromApi(consumer) {
  return {
    name: consumer.name || '',
    version: consumer.version || '',
    credentials: (consumer.credentials || []).map((credential) => ({
      type: credential.type,
      key: credential.key || '',
      source: credential.source || 'BEARER',
      headerName: credential.headerName || '',
      queryName: credential.queryName || '',
    })),
  }
}

export function validateConsumerForm(form) {
  const errors = []

  if (!form.name.trim()) {
    errors.push('请输入消费者名称')
  }

  if (!form.credentials.length) {
    errors.push('至少添加一个凭证')
  }

  form.credentials.forEach((credential) => {
    if (!credential.key?.trim()) {
      errors.push('请填写凭证 Key')
      return
    }

    if (credential.source === 'HEADER' && !credential.headerName?.trim()) {
      errors.push('请填写 Header 名称')
    }

    if (credential.source === 'QUERY' && !credential.queryName?.trim()) {
      errors.push('请填写 Query 参数名')
    }
  })

  return [...new Set(errors)]
}

export function toConsumerPayload(form) {
  return {
    ...(form.version ? { version: form.version } : {}),
    name: form.name.trim(),
    credentials: form.credentials.map((credential) => {
      const payload = {
        type: credential.type,
        key: credential.key,
        source: credential.source,
      }

      if (credential.source === 'HEADER' && credential.headerName) {
        payload.headerName = credential.headerName
      }

      if (credential.source === 'QUERY' && credential.queryName) {
        payload.queryName = credential.queryName
      }

      return payload
    }),
  }
}