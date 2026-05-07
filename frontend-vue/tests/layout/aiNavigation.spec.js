import { describe, expect, it } from 'vitest'
import { AI_MENU_ITEMS, isAiConsoleRoute } from '@/layout/aiNavigation'

describe('ai navigation', () => {
  it('detects ai-console routes by layoutVariant', () => {
    expect(isAiConsoleRoute({ meta: { layoutVariant: 'ai-console' } })).toBe(true)
    expect(isAiConsoleRoute({ meta: { layoutVariant: 'default' } })).toBe(false)
  })

  it('exposes the fixed menu labels in design order', () => {
    expect(AI_MENU_ITEMS.map((item) => item.title)).toEqual([
      '服务提供者',
      'AI 路由管理',
      '消费者管理',
    ])
  })
})