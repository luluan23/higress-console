export const dashboardFixture = {
  dashboard: {
    panels: [
      {
        title: 'Consumer Usage',
        datasource: { type: 'prometheus', uid: 'prom-main' },
        targets: [{ datasource: { type: 'prometheus', uid: 'prom-main' } }],
      },
      {
        title: 'Model Usage',
        targets: [{ datasource: { type: 'prometheus', uid: 'prom-main' } }],
      },
    ],
  },
}

export const tableResponseFixture = {
  results: {
    A: {
      frames: [
        {
          schema: {
            fields: [{ name: 'ai_consumer' }, { name: 'Value' }],
          },
          data: {
            values: [['KEY_USER_1', 'KEY_USER_2'], [5400, 1200]],
          },
        },
      ],
    },
  },
}

export const routeTableResponseFixture = {
  results: {
    A: {
      frames: [
        {
          schema: {
            fields: [{ name: 'ai_route' }, { name: 'Value' }],
          },
          data: {
            values: [['route-ai', 'route-fallback'], [4700, 1900]],
          },
        },
      ],
    },
  },
}

export const trendResponseFixture = {
  results: {
    A: {
      frames: [
        {
          schema: {
            fields: [{ name: 'Time' }, { name: 'Value' }],
          },
          data: {
            values: [[1715126400000, 1715212800000], [3200, 4100]],
          },
        },
      ],
    },
  },
}