import Layout from './../../layout/layoutIndex.vue'

const aiRoutes = {
  path: '/ai',
  component: Layout,
  meta: { title: 'AI 管理', layoutVariant: 'ai-console' },
  children: [
    {
      path: 'provider',
      name: 'aiProvider',
      component: () => import('@/views/ai/provider/index.vue'),
      meta: { title: '服务提供者', layoutVariant: 'ai-console' },
    },
    {
      path: 'route',
      name: 'aiRoute',
      component: () => import('@/views/ai/route/index.vue'),
      meta: { title: 'AI 路由管理', layoutVariant: 'ai-console' },
    },
    {
      path: 'consumer',
      name: 'aiConsumer',
      component: () => import('@/views/ai/consumer/index.vue'),
      meta: { title: '消费者管理', layoutVariant: 'ai-console' },
    },
    {
      path: 'statistics',
      name: 'aiStatistics',
      component: () => import('@/views/ai/statistics/index.vue'),
      meta: { title: '统计看板', layoutVariant: 'ai-console' },
    },
  ],
}

export default aiRoutes