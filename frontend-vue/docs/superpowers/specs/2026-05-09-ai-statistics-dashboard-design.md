# Higress AI 统计看板设计规格

**日期：** 2026-05-09  
**状态：** 待评审  
**作者：** GitHub Copilot + 用户协作  
**范围：** `frontend-vue/` 中新增面向管理员的 AI 统计看板页面，基于现有 Grafana 查询接口构建原生 Vue BI 驾驶舱。

---

## 1. 背景与目标

### 1.1 背景

`frontend-vue` 当前已经具备 AI 管理页骨架与三组管理页面：

- 服务提供者：`/ai/provider`
- AI 路由管理：`/ai/route`
- 消费者管理：`/ai/consumer`

仓库中同时已有 AI 观测相关输入：

- `docs/others/grafana/ai-statistic-metric.md` 记录了现有 Grafana 查询入口与 Prometheus 指标样例
- `docs/others/grafana/inspect_panel_consumer_usage.json`
- `docs/others/grafana/inspect_panel_model_usage.json`

这些资料说明当前系统已通过 `prometheus + grafana` 采集和展示 AI 统计数据，维度至少包括：

- `ai_consumer`
- `ai_model`
- `ai_route`
- `ai_cluster`

可用指标至少包括：

- `route_upstream_model_consumer_metric_input_token`
- `route_upstream_model_consumer_metric_output_token`
- `route_upstream_model_consumer_metric_total_token`
- `route_upstream_model_consumer_metric_llm_duration_count`
- `route_upstream_model_consumer_metric_llm_first_token_duration`
- `route_upstream_model_consumer_metric_llm_service_duration`
- `route_upstream_model_consumer_metric_llm_stream_duration_count`

用户已确认本次页面定位不是 Grafana iframe，而是原生 Vue BI 页面；数据边界是前端直接查询现有 Grafana 接口，而不是新增后端聚合 API。

### 1.2 产品目标

新增一个面向管理员的 AI 统计看板页面，满足以下目标：

1. 以经营分析为主轴，优先回答“最近一段时间 AI 使用规模、结构和变化趋势如何”。
2. 支持按时间范围筛选所有分析结果。
3. 支持按消费者、模型、路由进行联动筛选和钻取。
4. 在经营分析基础上，补充巡检洞察与治理建议，而不是只展示监控曲线。
5. 保持与当前 `ai-console` 路由、样式、导航模式一致，不另起一套 AI 控制台壳层。
6. 为后续扩展成本分析、导出、更多图表留出清晰的代码边界。

### 1.3 用户确认的关键决策

本次设计基于以下已确认决策：

1. 页面定位为**综合驾驶舱**。
2. 首页内容优先级为：`经营分析 > 巡检洞察 > 成本治理`。
3. 交付形态采用**原生控制台 BI 页面**，不以 Grafana 页面作为主视图。
4. 数据来源采用**前端直查现有 Grafana 查询接口**，尽量不改后端业务接口。

### 1.4 非目标

本次不包含以下内容：

1. 不新增后端统计聚合接口。
2. 不实现真实金额成本分析，因为当前输入指标不包含模型单价或成本配置。
3. 不实现通用报表导出中心、自定义指标编排器或多页签 BI 工作台。
4. 不重构现有 AI 管理三页的交互或样式体系。
5. 不将 Grafana iframe 再次作为看板主界面。

---

## 2. 约束与输入

### 2.1 前端约束

- 框架：Vue 3 + `script setup`
- 路由：`vue-router@4`
- 请求层：复用 `src/utils/request.js`
- 图表依赖：仓库已安装 `echarts`
- 当前 AI Console 页面风格：基于 `layoutVariant = 'ai-console'` 的现有布局分支
- 当前 AI 管理页实现风格：Element Plus + 定制 `ai-console.scss`

因此本页应沿用现有 `frontend-vue` AI 页模式，不引入与现状冲突的第二套 UI 体系。

### 2.2 数据源约束

本次数据不直查 Prometheus，而是通过现有 Grafana 查询入口：

- `POST /grafana/api/ds/query`

同时已有 AI dashboard 基础接口：

- `GET /dashboard/info?type=AI`

该接口返回 `DashboardInfo { builtIn, uid, url }`。后端 Grafana client 已定义 `api/dashboards/uid/{uid}` 路径，说明当前系统具备按 dashboard uid 读取 Grafana dashboard 配置的基础能力。

### 2.3 指标口径约束

当前可稳定依赖的原始统计维度是 token、count、duration，而不是金额成本。因此首期只做：

- 规模
- 结构
- 趋势
- 健康
- 治理风险

不做真实金额成本核算。

---

## 3. 总体定位与信息架构

### 3.1 页面定位

该页面不是传统监控页，而是管理员 AI 运营驾驶舱：

1. 先用 KPI 和趋势回答“整体业务量如何”。
2. 再用结构和排行回答“是谁造成了这些变化”。
3. 再用异常洞察回答“哪里值得进一步巡检”。
4. 最后用治理提示回答“应该采取什么管理动作”。

Grafana 继续承担“原始监控和深度排障入口”的角色，但不承担首页叙事结构。

### 3.2 导航位置

新增一级 AI 子路由：

```text
/ai/statistics
```

并在当前 AI 导航中新增菜单项：

- 统计看板

该页沿用现有 AI 管理路由组的显示策略，不引入新的前端权限系统。管理员可见性的约束与当前 AI 管理页保持一致。

### 3.3 页面骨架

页面自上而下分为 5 个区域：

1. 筛选栏
2. KPI 总览
3. 核心趋势 + 结构占比
4. 排行与异常洞察
5. 明细钻取与治理建议

布局原则：

- 首屏优先展示经营分析，不用告警红色压制整页氛围
- 用白色卡片承载图表，背景延续现有 `ai-console` 浅灰内容区
- 色彩主轴以蓝、青、琥珀为主，红色仅保留给异常提示

---

## 4. 指标体系与可视化设计

### 4.1 经营规模指标

首页核心 KPI 建议包括：

1. 总 Token 消耗
2. 输入 Token
3. 输出 Token
4. 请求次数
5. 活跃消费者数
6. 活跃模型数
7. 平均首 Token 时延
8. 平均服务时长

派生指标建议包括：

1. 单次请求平均 Token
2. 人均请求量
3. Top3 消费者贡献度
4. Top3 模型贡献度
5. 输入/输出 Token 比例

变化率统一定义为：

- 当前时间窗口 vs 上一等长时间窗口

首期文案不使用“自然年同比”表述，避免产生错误业务含义。

### 4.2 消费者分析维度

消费者视角建议包含：

1. 消费者总 Token 占比
2. 消费者请求数占比
3. 消费者增长率
4. 消费者输入/输出 Token 结构
5. 消费者活跃趋势
6. 消费者波动度
7. Top 消耗消费者
8. Top 增长消费者
9. Top 波动消费者

### 4.3 模型分析维度

模型视角建议包含：

1. 模型总 Token 占比
2. 模型请求数占比
3. 模型增长率
4. 模型平均首 Token 时延
5. 模型平均服务时长
6. 模型平均单次输出 Token
7. 高使用低时延模型
8. 高使用高时延模型

### 4.4 路由与治理维度

首期将路由作为可筛选与可钻取维度，并补充以下治理指标：

1. 路由承载结构占比
2. 单一路由负载集中度
3. 长尾消费者贡献占比
4. 长尾模型贡献占比
5. 异常突增/突降
6. 热点时间桶
7. 高集中度风险提示
8. 高时延风险提示

### 4.5 首期推荐图表组合

首期优先级从高到低如下：

1. `KPI 卡片 + sparkline`
2. `双轴趋势图`：Token/请求量 + 时延
3. `消费者排行条形图`
4. `模型排行条形图`
5. `占比图`：消费者占比、模型占比、输入输出结构占比
6. `异常洞察列表`
7. `明细表`
8. `热力图或象限散点图` 作为增强项

其中：

- 热力图适合看热点时段与波动
- 象限散点图适合看“高使用高时延”与“高使用低时延”的模型聚类

### 4.6 首页推荐模块顺序

首页推荐顺序固定为：

1. 经营总览
2. 结构分析
3. 巡检洞察
4. 治理建议

这样可以保持与用户确认的优先级一致：`经营分析 > 巡检 > 治理`。

---

## 5. 查询与数据模型设计

### 5.1 总体思路

前端不直接在页面组件里拼 PromQL，而是在统计页内部建立四层边界：

1. 页面层：负责布局与交互
2. 查询编排层：负责请求批次、联动刷新、并发和降级
3. Grafana 适配层：负责调用 `/grafana/api/ds/query`
4. 指标语义层：负责从原始 metric 构建业务化口径

### 5.2 数据源解析流程

首屏加载采用以下顺序：

1. 调用 `GET /dashboard/info?type=AI`
2. 若返回 `uid`，通过 Grafana dashboard 配置读取该 dashboard 的 panel 信息
3. 从 AI 相关 panel 中提取 Prometheus datasource uid
4. 使用该 datasource uid 调用 `/grafana/api/ds/query`

明确约束：

1. 不硬编码 `inspect_panel_consumer_usage.json` 或 `inspect_panel_model_usage.json` 中的 datasource uid
2. `inspect_panel_*.json` 只作为设计与联调用参考，不作为运行期配置来源
3. 若 datasource uid 解析失败，页面显示“统计数据源未就绪”状态，并提供 Grafana 深钻入口

### 5.3 过滤条件模型

全局筛选模型建议为：

```js
{
  timeRange: { from: string, to: string, preset: '24h' | '7d' | '30d' | 'custom' },
  granularity: 'hour' | 'day',
  consumers: string[],
  models: string[],
  routes: string[],
}
```

筛选规则：

1. 时间范围是一级必选条件
2. 消费者、模型、路由均支持多选
3. 粒度默认自动推断：短窗口优先小时，长窗口优先天
4. 所有图表共享同一筛选状态

### 5.4 查询分类

查询分为三类：

1. `instant` 聚合查询
用于：KPI、排行、占比、活跃数、集中度

2. `range` 趋势查询
用于：Token 趋势、请求趋势、时延趋势、热点分析

3. `comparison` 对比查询
用于：当前窗口 vs 上一窗口的变化率

对比查询采用两个等长时间窗口并行查询，在前端合并结果计算变化率。

### 5.5 指标口径定义

建议统一由 `metricCatalog` 描述原始指标与派生规则。

示例口径：

1. 总 Token

```text
sum(increase(route_upstream_model_consumer_metric_total_token{filters}[$range]))
```

2. 输入 Token

```text
sum(increase(route_upstream_model_consumer_metric_input_token{filters}[$range]))
```

3. 输出 Token

```text
sum(increase(route_upstream_model_consumer_metric_output_token{filters}[$range]))
```

4. 请求次数

```text
sum(increase(route_upstream_model_consumer_metric_llm_duration_count{filters}[$range]))
```

5. 平均首 Token 时延

```text
sum(increase(route_upstream_model_consumer_metric_llm_first_token_duration{filters}[$range]))
/
sum(increase(route_upstream_model_consumer_metric_llm_duration_count{filters}[$range]))
```

6. 平均服务时长

```text
sum(increase(route_upstream_model_consumer_metric_llm_service_duration{filters}[$range]))
/
sum(increase(route_upstream_model_consumer_metric_llm_duration_count{filters}[$range]))
```

实现约束：

1. 请求次数口径首选 `llm_duration_count`
2. 如果联调发现该指标语义与真实请求数不符，则统一回退到当前 Grafana AI 面板正在使用的 count 指标
3. 实现中不能混用两个 count 指标，否则变化率和均值会失真

### 5.6 维度分组查询

为满足消费者、模型、路由视角，查询构造器至少支持：

1. `sum by(ai_consumer)`
2. `sum by(ai_model)`
3. `sum by(ai_route)`
4. `sum by(ai_consumer, ai_model)`

`ai_cluster` 首期不放在首页筛选栏，但保留在数据模型中，便于后续加入更深钻取。

### 5.7 Grafana 返回归一化

Grafana `ds/query` 返回结构可能因 `format` 和查询类型而异，因此前端必须统一归一化成如下语义对象：

```js
{
  dimensions: { consumer?: string, model?: string, route?: string },
  value: number,
  timestamp?: number,
  metricKey: string,
}
```

所有组件只消费归一化后的结果，不直接访问 Grafana 原始响应字段。

---

## 6. 页面交互设计

### 6.1 筛选栏交互

筛选栏包含：

1. 时间范围选择
2. 粒度选择
3. 消费者多选
4. 模型多选
5. 路由多选
6. 重置按钮
7. 刷新按钮

默认值建议：

- 时间范围：最近 7 天
- 粒度：自动
- 消费者/模型/路由：全部

### 6.2 图表反向钻取

首页所有关键图表都支持写回筛选条件：

1. 点击消费者排行项，将消费者加入筛选
2. 点击模型占比分区，将模型加入筛选
3. 点击异常洞察项，直接跳到对应的消费者、模型或路由视角

### 6.3 明细视角切换

明细表支持三种视角：

1. 按消费者
2. 按模型
3. 按路由

视角切换只改变表格聚合维度和排序字段，不改变全局筛选。

### 6.4 Grafana 深钻入口

页面保留一个明确但次级的入口：

- `查看原始监控`

该入口打开现有 AI dashboard 或对应 Grafana 页面，用于管理员做原始监控排障。它不应放在 KPI 区抢占主叙事，只作为辅助入口。

### 6.5 体验细节

页面顶部补充以下信息：

1. 当前数据时间范围
2. 最近刷新时间
3. 数据说明提示

图表 tooltip 中应同时展示：

1. 当前值
2. 上一窗口值
3. 变化率

异常表现形式：

1. 以标签、图标、次级强调色表达
2. 不把整个页面渲染成重告警风格

---

## 7. 组件与文件结构设计

### 7.1 路由变更

修改以下文件：

- `src/router/modules/aiRoutes.js`
- `src/layout/aiNavigation.js`

新增导航项：

- 统计看板

### 7.2 新增文件建议

```text
src/
├── api/
│   └── aiStatisticsApi.js
├── views/
│   └── ai/
│       └── statistics/
│           ├── index.vue
│           ├── useAiStatisticsDashboard.js
│           ├── metricCatalog.js
│           ├── queryBuilder.js
│           └── transform.js
└── components/
    └── ai/
        └── statistics/
            ├── StatisticsFilterBar.vue
            ├── StatisticsKpiRow.vue
            ├── UsageTrendChart.vue
            ├── DistributionChart.vue
            ├── TopRankingPanel.vue
            ├── InsightListPanel.vue
            ├── StatisticsDetailTable.vue
            └── StatisticsEmptyState.vue
```

### 7.3 组件职责

1. `StatisticsFilterBar.vue`
   负责时间、消费者、模型、路由、粒度切换

2. `StatisticsKpiRow.vue`
   负责 KPI 卡片与小趋势线

3. `UsageTrendChart.vue`
   负责总量/请求数/时延双轴趋势图

4. `DistributionChart.vue`
   负责消费者占比、模型占比、输入输出结构占比

5. `TopRankingPanel.vue`
   负责消费者 Top 和模型 Top 排行

6. `InsightListPanel.vue`
   负责异常波动、集中度、热点提示

7. `StatisticsDetailTable.vue`
   负责消费者/模型/路由明细视角

8. `StatisticsEmptyState.vue`
   负责无数据、查询失败、数据源未就绪

### 7.4 编排 Hook 职责

`useAiStatisticsDashboard.js` 负责：

1. 初始化 datasource uid
2. 初始化筛选字典
3. 并发触发多个查询批次
4. 汇总 loading、error、empty 状态
5. 管理点击图表后的钻取写回
6. 处理请求竞态，防止筛选快速切换后旧响应覆盖新状态

---

## 8. 空态、失败态与性能策略

### 8.1 状态分层

页面必须区分三种状态：

1. `无数据`
   当前筛选范围内没有有效统计结果

2. `查询失败`
   Grafana 查询报错或响应解析失败

3. `数据源未就绪`
   AI dashboard 未初始化或 datasource uid 无法解析

### 8.2 降级原则

首屏不是“全有或全无”，而是模块级降级：

1. KPI 失败不阻塞趋势图
2. 排行失败不阻塞明细表
3. 某一块失败时只在该卡片内展示错误态

### 8.3 性能原则

1. 首屏优先展示筛选栏和骨架屏
2. KPI 与趋势图优先加载
3. 排行、洞察、明细可以后续返回
4. 尽量避免单个慢查询拖住整页首屏

---

## 9. 测试设计

### 9.1 单元测试

至少覆盖以下内容：

1. 查询表达式构造
2. Grafana 响应归一化
3. 平均时延计算
4. 变化率计算
5. 集中度计算
6. 异常洞察生成逻辑

### 9.2 组件测试

至少覆盖以下交互：

1. 筛选条件变化后触发刷新
2. 点击排行项后写回筛选栏
3. 局部失败态展示
4. 无数据态展示
5. 明细视角切换

### 9.3 测试数据策略

不依赖真实 Grafana 环境跑前端测试，改用固定 fixture：

1. 消费者聚合响应 fixture
2. 模型聚合响应 fixture
3. 趋势 range 响应 fixture
4. 失败响应 fixture
5. 空数据响应 fixture

---

## 10. 分期建议

### 10.1 一期

一期范围仅包含：

1. `/ai/statistics` 页面
2. 时间范围 + 消费者 + 模型 + 路由筛选
3. KPI、趋势、排行、占比、洞察、明细
4. Grafana 深钻入口
5. 完整空态与局部失败态

### 10.2 二期候选

二期可扩展：

1. 成本配置接入后的真实金额分析
2. 高级钻取页面
3. 导出与订阅
4. 热力图 / 象限图增强
5. `ai_cluster` 维度下钻

---

## 11. 最终设计结论

本次统计看板的最终产品定义如下：

1. 它是一个管理员原生 BI 驾驶舱，而不是监控 iframe。
2. 首页先讲经营，再讲结构，再讲异常，再给治理建议。
3. 所有数据都围绕统一时间窗口和多维筛选联动。
4. 技术上通过查询编排层、Grafana 适配层、指标语义层解耦，避免页面直接堆叠 PromQL。
5. Grafana 继续保留为原始监控和深度排障入口，但不承担首页主体角色。
