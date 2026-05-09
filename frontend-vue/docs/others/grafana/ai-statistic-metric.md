# grfana 查询数据接口
Method: POST
URL: http://localhost:18001/grafana/api/ds/query

## panel
1. inspect_panel_consumer_usage.json
   消费者使用情况统计，包含输入输出token数量、总量
2. inspect_panel_model_usage.json
   模型使用情况统计，包含输入输出token数量、总量

# AI 统计（ai-statistic） 插件的指标

从 prometheus 中查询指标

Method: GET
URL: http://localhost:19090/prometheus/api/v1/query?query={__name__=~%22route_upstream_model_consumer_metric_.*%22}

返回结果
```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": {
          "__name__": "route_upstream_model_consumer_metric_input_token",
          "ai_cluster": "outbound|443||llm-ksyun.internal.dns",
          "ai_consumer": "KEY_USER_1",
          "ai_model": "deepseek-v4-flash",
          "ai_route": "ai-route-ksyun.internal",
          "container": "higress-gateway",
          "higress": "higress-system-higress-gateway",
          "instance": "localhost:15020",
          "job": "gateway",
          "namespace": "higress-system",
          "pod": "higress"
        },
        "value": [1778234172.32, "8786"
        ]
      },
      {
        "metric": {
          "__name__": "route_upstream_model_consumer_metric_llm_duration_count",
          "ai_cluster": "outbound|443||llm-ksyun.internal.dns",
          "ai_consumer": "KEY_USER_1",
          "ai_model": "deepseek-v4-flash",
          "ai_route": "ai-route-ksyun.internal",
          "container": "higress-gateway",
          "higress": "higress-system-higress-gateway",
          "instance": "localhost:15020",
          "job": "gateway",
          "namespace": "higress-system",
          "pod": "higress"
        },
        "value": [1778234172.32, "8"
        ]
      },
      {
        "metric": {
          "__name__": "route_upstream_model_consumer_metric_llm_first_token_duration",
          "ai_cluster": "outbound|443||llm-ksyun.internal.dns",
          "ai_consumer": "KEY_USER_1",
          "ai_model": "deepseek-v4-flash",
          "ai_route": "ai-route-ksyun.internal",
          "container": "higress-gateway",
          "higress": "higress-system-higress-gateway",
          "instance": "localhost:15020",
          "job": "gateway",
          "namespace": "higress-system",
          "pod": "higress"
        },
        "value": [1778234172.32, "5255"
        ]
      },
      {
        "metric": {
          "__name__": "route_upstream_model_consumer_metric_llm_service_duration",
          "ai_cluster": "outbound|443||llm-ksyun.internal.dns",
          "ai_consumer": "KEY_USER_1",
          "ai_model": "deepseek-v4-flash",
          "ai_route": "ai-route-ksyun.internal",
          "container": "higress-gateway",
          "higress": "higress-system-higress-gateway",
          "instance": "localhost:15020",
          "job": "gateway",
          "namespace": "higress-system",
          "pod": "higress"
        },
        "value": [1778234172.32, "17997"
        ]
      },
      {
        "metric": {
          "__name__": "route_upstream_model_consumer_metric_llm_stream_duration_count",
          "ai_cluster": "outbound|443||llm-ksyun.internal.dns",
          "ai_consumer": "KEY_USER_1",
          "ai_model": "deepseek-v4-flash",
          "ai_route": "ai-route-ksyun.internal",
          "container": "higress-gateway",
          "higress": "higress-system-higress-gateway",
          "instance": "localhost:15020",
          "job": "gateway",
          "namespace": "higress-system",
          "pod": "higress"
        },
        "value": [1778234172.32, "8"
        ]
      },
      {
        "metric": {
          "__name__": "route_upstream_model_consumer_metric_output_token",
          "ai_cluster": "outbound|443||llm-ksyun.internal.dns",
          "ai_consumer": "KEY_USER_1",
          "ai_model": "deepseek-v4-flash",
          "ai_route": "ai-route-ksyun.internal",
          "container": "higress-gateway",
          "higress": "higress-system-higress-gateway",
          "instance": "localhost:15020",
          "job": "gateway",
          "namespace": "higress-system",
          "pod": "higress"
        },
        "value": [1778234172.32, "1961"
        ]
      },
      {
        "metric": {
          "__name__": "route_upstream_model_consumer_metric_total_token",
          "ai_cluster": "outbound|443||llm-ksyun.internal.dns",
          "ai_consumer": "KEY_USER_1",
          "ai_model": "deepseek-v4-flash",
          "ai_route": "ai-route-ksyun.internal",
          "container": "higress-gateway",
          "higress": "higress-system-higress-gateway",
          "instance": "localhost:15020",
          "job": "gateway",
          "namespace": "higress-system",
          "pod": "higress"
        },
        "value": [1778234172.32, "10747"
        ]
      }
    ]
  }
}
```
