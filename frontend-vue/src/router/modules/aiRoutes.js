import Layout from '../../layout/layoutIndex.vue'

const aiRoutes = {
  path: '/ai',
  component: Layout,
  redirect: '/ai/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'AiDashboard',
      component: () => import('../../views/ai/dashboard/index.vue'),
      meta: { title: '仪表盘', roles: ['user', 'admin'] },
    },
    {
      path: 'endpoint',
      name: 'AiEndpoint',
      component: () => import('../../views/ai/endpoint/index.vue'),
      meta: { title: 'API 端点', roles: ['user', 'admin'] },
    },
    {
      path: 'usage',
      name: 'AiUsage',
      component: () => import('../../views/ai/usage/index.vue'),
      meta: { title: '用量明细', roles: ['user', 'admin'] },
    },
    {
      path: 'provider',
      name: 'AiProvider',
      component: () => import('../../views/ai/provider/index.vue'),
      meta: { title: 'AI 模型', roles: ['admin'] },
    },
    {
      path: 'route',
      name: 'AiRoute',
      component: () => import('../../views/ai/route/index.vue'),
      meta: { title: 'AI 路由', roles: ['admin'] },
    },
    {
      path: 'consumer',
      name: 'AiConsumer',
      component: () => import('../../views/ai/consumer/index.vue'),
      meta: { title: '消费者 KEY', roles: ['admin'] },
    },
    {
      path: 'overview',
      name: 'AiOverview',
      component: () => import('../../views/ai/overview/index.vue'),
      meta: { title: '系统概览', roles: ['admin'] },
    },
    {
      path: 'monitor',
      name: 'AiMonitor',
      component: () => import('../../views/ai/monitor/index.vue'),
      meta: { title: '监控看板', roles: ['admin'] },
    },
  ],
}

export default aiRoutes
