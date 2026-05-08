export const AI_MENU_ITEMS = [
  { path: '/ai/provider', title: '服务提供者' },
  { path: '/ai/route', title: 'AI 路由管理' },
  { path: '/ai/consumer', title: '消费者管理' },
  { path: '/ai/statistics', title: '统计看板' },
]

export function isAiConsoleRoute(route) {
  return route?.meta?.layoutVariant === 'ai-console'
}