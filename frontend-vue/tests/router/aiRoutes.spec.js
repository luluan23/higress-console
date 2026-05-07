import { describe, expect, it } from 'vitest'
import { constantRoutes } from '@/router'

describe('AI route registration', () => {
  it('registers the three AI management pages under /ai', () => {
    const aiRoute = constantRoutes.find((route) => route.path === '/ai')

    expect(aiRoute).toBeDefined()
    expect(aiRoute.children.map((child) => child.name)).toEqual([
      'aiProvider',
      'aiRoute',
      'aiConsumer',
    ])
    expect(
      aiRoute.children.every((child) => child.meta.layoutVariant === 'ai-console')
    ).toBe(true)
  })
})