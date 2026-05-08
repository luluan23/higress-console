export const METRICS = {
  inputToken: 'route_upstream_model_consumer_metric_input_token',
  outputToken: 'route_upstream_model_consumer_metric_output_token',
  totalToken: 'route_upstream_model_consumer_metric_total_token',
  requestCount: 'route_upstream_model_consumer_metric_llm_duration_count',
  firstTokenDuration: 'route_upstream_model_consumer_metric_llm_first_token_duration',
  serviceDuration: 'route_upstream_model_consumer_metric_llm_service_duration',
}

export const DEFAULT_FILTERS = {
  timeRange: { from: 'now-7d', to: 'now', preset: '7d' },
  granularity: 'day',
  consumers: [],
  models: [],
  routes: [],
}

export const KPI_KEYS = [
  { key: 'totalToken', label: '总 Token 消耗' },
  { key: 'inputToken', label: '输入 Token' },
  { key: 'outputToken', label: '输出 Token' },
  { key: 'requestCount', label: '请求次数' },
  { key: 'activeConsumers', label: '活跃消费者数' },
  { key: 'activeModels', label: '活跃模型数' },
  { key: 'averageFirstToken', label: '平均首 Token 时延' },
  { key: 'averageServiceDuration', label: '平均服务时长' },
]