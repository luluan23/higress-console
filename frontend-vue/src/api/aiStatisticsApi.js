import request from '@/utils/request'

export function getAiDashboardInfo() {
  return request({
    url: '/dashboard/info',
    method: 'GET',
    params: { type: 'AI' },
  })
}

export function getGrafanaDashboard(uid) {
  return request({
    url: `/grafana/api/dashboards/uid/${uid}`,
    method: 'GET',
  })
}

export function queryGrafanaDatasource({ dataSourceUid, from, to, queries }) {
  return request({
    url: '/grafana/api/ds/query',
    method: 'POST',
    data: {
      from,
      to,
      queries: queries.map((query) => ({
        ...query,
        datasource: { type: 'prometheus', uid: dataSourceUid },
      })),
    },
  })
}