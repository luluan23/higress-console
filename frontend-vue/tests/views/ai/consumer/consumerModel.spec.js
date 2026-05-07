import { describe, expect, it } from 'vitest'
import {
  createConsumerForm,
  toConsumerPayload,
  validateConsumerForm,
} from '@/views/ai/consumer/consumerModel'

describe('consumerModel', () => {
  it('strips header and query names for bearer credentials', () => {
    const form = createConsumerForm()
    form.name = 'mobile-client'
    form.credentials = [
      {
        type: 'key-auth',
        key: 'secret',
        source: 'BEARER',
        headerName: 'x-api-key',
        queryName: 'api_key',
      },
    ]

    expect(toConsumerPayload(form)).toEqual({
      name: 'mobile-client',
      credentials: [
        {
          type: 'key-auth',
          key: 'secret',
          source: 'BEARER',
        },
      ],
    })
  })

  it('returns a validation error when a credential key is empty', () => {
    const form = createConsumerForm()
    form.name = 'mobile-client'

    expect(validateConsumerForm(form)).toContain('请填写凭证 Key')
  })
})