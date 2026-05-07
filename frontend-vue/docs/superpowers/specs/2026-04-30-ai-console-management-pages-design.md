# Higress AI 管理页面落地设计规格

**日期：** 2026-04-30  
**状态：** 待评审  
**作者：** GitHub Copilot + 用户协作  
**范围：** `frontend-vue/` 中基于 `design.pen` 落地 AI 服务提供者、AI 路由、消费者三组管理页面与交互态，并真实接入后端 CRUD API。

---

## 1. 背景与目标

### 1.1 背景

`frontend-vue` 当前仅有通用布局和空白主页，尚未实现 AI 管理模块。仓库已提供：

- 设计稿：`design.pen`
- 真实接口定义：`swagger-api-docs.json`
- 现有 Vue 3 + vue-router + Pinia + TDesign 技术栈

设计稿中已经完整定义了以下画板：

- `AI 服务提供者管理`
- `AI 路由管理`
- `消费者管理`
- 三个创建/编辑抽屉
- 三个删除确认弹窗
- Provider、Route、Consumer 的 4 个变体态

### 1.2 目标

在不新建独立 AI 壳层的前提下，直接扩展现有全局 `Layout`，完成以下功能：

1. 实现 AI 服务提供者、AI 路由、消费者三组真实业务页面。
2. 接入真实后端 CRUD API：
   - `/v1/ai/providers`
   - `/v1/ai/routes`
   - `/v1/consumers`
3. 还原设计稿中的主要视觉结构、抽屉、删除确认与变体态。
4. 将新视觉尽量限制在 AI 模块路由下，避免对现有非 AI 页面造成不必要回归。

### 1.3 非目标

本次不包含以下内容：

1. 不实现 AI 仪表盘、端点页、用量页、系统概览、Grafana 监控等其他 AI 页面。
2. 不重写整个站点布局系统。
3. 不为后端当前未提供的健康探测能力伪造真实接口。

---

## 2. 约束与输入

### 2.1 技术约束

- 框架：Vue 3
- 路由：`vue-router@4`，Hash History
- 状态：Pinia
- 请求层：复用 `src/utils/request.js`
- UI 现状：全局布局与侧栏偏 Element Plus 风格，项目同时已安装 TDesign
- 构建：Vite

### 2.2 设计约束

采用用户最终确认的**方案 1**：在现有全局 `Layout` 上扩展，而不是新建独立 AI 控制台壳层。

这意味着：

1. AI 页面仍运行在当前 `layout/layoutIndex.vue` 体系内。
2. 侧栏、内容容器、页头样式需要支持 AI 专属视觉变体。
3. 需要通过路由元信息控制 AI 模块与普通模块的样式分流，降低改动外溢风险。

### 2.3 API 约束

根据 `swagger-api-docs.json`：

#### LLM Provider API

- `GET /v1/ai/providers`
- `POST /v1/ai/providers`
- `GET /v1/ai/providers/{name}`
- `PUT /v1/ai/providers/{name}`
- `DELETE /v1/ai/providers/{name}`

#### AI Route API

- `GET /v1/ai/routes`
- `POST /v1/ai/routes`
- `GET /v1/ai/routes/{name}`
- `PUT /v1/ai/routes/{name}`
- `DELETE /v1/ai/routes/{name}`

#### Consumer API

- `GET /v1/consumers`
- `POST /v1/consumers`
- `GET /v1/consumers/{name}`
- `PUT /v1/consumers/{name}`
- `DELETE /v1/consumers/{name}`

重要接口模型约束：

1. `LlmProvider`、`AiRoute`、`Consumer` 的更新请求都依赖完整对象内容。
2. Provider、Route 的更新模型都包含 `version` 字段，编辑前必须先拉详情。
3. Route、Consumer 都存在嵌套结构，需要在页面表单模型与接口模型之间做双向映射。

---

## 3. 总体设计

### 3.1 总体策略

采用“**现有布局增强 + AI 路由专属视觉分支 + 业务页局部状态驱动**”的方式实现。

核心思路：

1. 保留现有全局 `Layout` 与主路由挂载方式。
2. 为 AI 模块路由增加 `meta.layoutVariant = 'ai-console'` 标记。
3. 在 `Layout` 与 `Sidebar` 中根据该标记切换到 AI 风格视觉和导航结构。
4. 三个业务页各自负责列表、抽屉、删除确认、变体态切换。
5. API 层只负责真实接口访问与模型转换，不直接承载 UI 状态。

### 3.2 风险控制

为了避免对现有系统产生全局样式污染，AI 风格的布局改造必须满足：

1. 所有新样式挂在 AI 路由专属类名下，例如 `.ai-console-layout`、`.ai-console-page`。
2. Sidebar 对 AI 路由与普通路由采用分支渲染，而不是直接替换原菜单渲染逻辑。
3. 非 AI 页面继续沿用原有菜单和内容区结构。

---

## 4. 路由与布局设计

### 4.1 新增路由

新增一个 AI 路由模块文件，挂载到现有根布局下：

```text
/
└── ai
    ├── provider
    ├── route
    └── consumer
```

推荐路由结构：

```js
{
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
  ],
}
```

### 4.2 Layout 改造

`src/layout/layoutIndex.vue` 需要新增一个基于当前路由 meta 的派生状态：

- 当前路由是否为 AI Console 风格

AI 风格启用后，布局行为变更如下：

1. 外层容器增加 `.ai-console-layout` 类名。
2. 主内容区背景改为设计稿浅灰底色。
3. 导航栏按需隐藏或弱化，不再让旧样式主导页面视觉。
4. 侧栏使用 AI 版分组结构与深色视觉。

### 4.3 Sidebar 改造

`src/layout/components/sidebar/index.vue` 需要支持双模式：

1. 普通模式：保留原有基于 `permissionRoutes` 的渲染。
2. AI 模式：渲染固定的 AI 导航结构，不依赖旧权限菜单配置。

AI 模式下侧栏分组：

- 组标题：`AI 管理`
- 菜单项：
  - 服务提供者
  - AI 路由管理
  - 消费者管理

视觉要求：

1. 深蓝背景。
2. 当前项高亮底色与左侧强调条。
3. 与设计稿一致的分组内边距、圆角和层级。

---

## 5. 文件结构设计

### 5.1 新增文件

```text
src/
├── api/
│   └── aiApi.js
├── router/
│   └── modules/
│       └── aiRoutes.js
├── views/
│   └── ai/
│       ├── provider/
│       │   ├── index.vue
│       │   └── ProviderDrawer.vue
│       ├── route/
│       │   ├── index.vue
│       │   └── RouteDrawer.vue
│       └── consumer/
│           ├── index.vue
│           └── ConsumerDrawer.vue
├── components/
│   └── ai/
│       ├── PageToolbar.vue
│       ├── DeleteConfirmDialog.vue
│       ├── StatusTag.vue
│       ├── provider/
│       │   └── TokenListField.vue
│       ├── route/
│       │   └── UpstreamListField.vue
│       └── consumer/
│           └── CredentialListField.vue
└── styles/
    └── ai-console.scss
```

### 5.2 修改文件

- `src/router/index.js`
- `src/layout/layoutIndex.vue`
- `src/layout/components/sidebar/index.vue`
- `src/styles/variables.scss`
- `src/styles/main.scss` 或等效全局样式入口

### 5.3 责任划分

1. `aiApi.js`
   - 封装 Provider、Route、Consumer 的列表、详情、创建、更新、删除接口。
   - 负责最薄层的接口访问，不承载页面视图状态。

2. 各业务 `index.vue`
   - 负责列表渲染、筛选、分页、按钮操作、抽屉开关、删除确认。

3. 各业务 `Drawer.vue`
   - 只负责表单、校验、表单联动、提交事件。

4. `DeleteConfirmDialog.vue`
   - 通用危险操作确认弹窗。

5. 动态字段组件
   - 抽离数组型表单逻辑，避免抽屉文件过大。

---

## 6. 页面与组件边界

### 6.1 Provider 页面

#### 页面职责

1. Provider 列表加载与搜索。
2. 协议、状态等筛选交互。
3. 打开新建/编辑抽屉。
4. 删除确认。
5. `Qwen + token failover` 变体态展示。

#### 列表列建议

- Provider 名称
- 类型
- 协议
- Token 数量 / 模式说明
- Failover 状态
- 健康状态
- 操作：编辑、删除、测试

#### 抽屉字段

- `name`
- `type`
- `protocol`
- `proxyName`
- `tokens[]`
- `tokenFailoverConfig.enabled`
- `tokenFailoverConfig.failureThreshold`
- `tokenFailoverConfig.successThreshold`
- `tokenFailoverConfig.healthCheckInterval`
- `tokenFailoverConfig.healthCheckTimeout`
- `tokenFailoverConfig.healthCheckModel`
- `rawConfigs`

#### 变体态规则

1. 当 `type === 'qwen'` 且启用 failover 时，展示高级降级配置区。
2. Token 展示文案规则：
   - 1 个 token：`单 Token`
   - 多 token 且未开启 failover：`轮询负载均衡`
   - 多 token 且开启 failover：`Failover 备份`

#### 健康状态说明

Swagger 中没有 Provider 健康探测接口，因此：

1. 默认展示 `未检测`。
2. `测试` 按钮仅保留 UI 入口和提示，不伪造后端状态。
3. 若未来后端补充测试接口，此处可无缝替换。

### 6.2 Route 页面

#### 页面职责

1. AI Route 列表加载与名称搜索。
2. 新建/编辑抽屉。
3. 删除确认。
4. 多上游、fallback、认证空选态的展示与校验。

#### 列表列建议

- 路由名称
- 域名
- Upstream 摘要
- 鉴权状态
- Fallback 状态
- 操作：编辑、删除

#### 抽屉字段

- `name`
- `domains[]`
- `pathPredicate`
- `upstreams[]`
  - `provider`
  - `weight`
  - `modelMapping`
- `authConfig.enabled`
- `authConfig.allowedConsumers[]`
- `fallbackConfig.enabled`
- `fallbackConfig.fallbackStrategy`
- `fallbackConfig.upstreams[]`
- `fallbackConfig.responseCodes[]`

#### 变体态规则

1. 当 `upstreams.length > 1` 时，列表与抽屉进入多目标态。
2. 开启 fallback 后展示策略、fallback upstream 与响应码配置。
3. 开启 auth 但未选择 `allowedConsumers` 时，页面保留设计稿中的空选态提示，并阻止提交。

### 6.3 Consumer 页面

#### 页面职责

1. Consumer 列表加载、搜索、分页。
2. 新建/编辑抽屉。
3. 删除确认。
4. `BEARER / HEADER / QUERY` 三种认证来源变体态切换。

#### 列表列建议

- Consumer 名称
- 凭证类型
- 来源类型
- 更新时间或摘要信息
- 操作：编辑、删除

#### 抽屉字段

- `name`
- `credentials[]`
  - `type`
  - `key`
  - `source`
  - `headerName`
  - `queryName`

#### 变体态规则

1. `BEARER` 模式下仅展示 token/key 字段。
2. `HEADER` 模式下必须展示并校验 header 名。
3. `QUERY` 模式下必须展示并校验 query 参数名。

---

## 7. 数据流与 API 映射

### 7.1 统一数据流

每个页面遵循同一流程：

1. 页面进入时调用列表接口。
2. 用户搜索/筛选/翻页时重新拉取列表。
3. 用户点击编辑时先调用详情接口，再打开抽屉。
4. 用户提交表单时：
   - 新建走 `POST`
   - 编辑走 `PUT`
5. 删除确认后走 `DELETE`，成功后刷新列表。

### 7.2 Provider API 映射

- 列表：`GET /v1/ai/providers`
- 详情：`GET /v1/ai/providers/{name}`
- 新建：`POST /v1/ai/providers`
- 更新：`PUT /v1/ai/providers/{name}`
- 删除：`DELETE /v1/ai/providers/{name}`

### 7.3 Route API 映射

- 列表：`GET /v1/ai/routes`
- 详情：`GET /v1/ai/routes/{name}`
- 新建：`POST /v1/ai/routes`
- 更新：`PUT /v1/ai/routes/{name}`
- 删除：`DELETE /v1/ai/routes/{name}`

### 7.4 Consumer API 映射

- 列表：`GET /v1/consumers`
- 详情：`GET /v1/consumers/{name}`
- 新建：`POST /v1/consumers`
- 更新：`PUT /v1/consumers/{name}`
- 删除：`DELETE /v1/consumers/{name}`

### 7.5 详情优先策略

编辑不能直接使用列表行数据回填表单。必须先拉详情，原因如下：

1. 更新请求依赖完整对象结构。
2. Provider、Route 更新依赖 `version`。
3. 列表接口可能不返回完整嵌套对象。

### 7.6 View Model 与接口模型分离

页面内部维护表单友好的 View Model，提交前再转换为后端模型：

1. Provider
   - UI 将 failover 字段平铺为可编辑表单字段。
   - 提交时再组装 `tokenFailoverConfig`。

2. Route
   - UI 将 `modelMapping` 转为键值对编辑结构。
   - 提交时再转回对象字典。

3. Consumer
   - UI 将 credential 来源态拆成 `source/headerName/queryName`。
   - 提交时只保留接口真实需要的凭证字段。

---

## 8. 校验与错误处理

### 8.1 基础校验

#### Provider

- 名称必填
- 类型必填
- 协议必填
- 至少一个 token

#### Route

- 名称必填
- 至少一个 domain
- 至少一个 upstream

#### Consumer

- 名称必填
- 至少一个 credential

所有数值字段都必须做最小值校验，禁止将空字符串作为数字提交。

### 8.2 业务联动校验

1. Provider 开启 failover 后，相关阈值和健康检查字段才允许填写与提交。
2. Route 开启 auth 后，若 `allowedConsumers` 为空则禁止提交。
3. Route fallback 策略为 `SEQ` 时，fallback upstream 只允许一项。
4. Consumer 在 `HEADER` 模式下必须填写 header 名。
5. Consumer 在 `QUERY` 模式下必须填写 query 参数名。
6. Consumer 在 `BEARER` 模式下必须清空 `headerName` 与 `queryName`，避免脏数据残留。

### 8.3 Payload 清洗

提交前统一执行请求体清洗：

1. 去除纯 UI 临时字段。
2. 去除空对象、空数组和无效值。
3. 保证请求体只包含 swagger 定义允许的结构。

### 8.4 错误处理

1. 列表加载失败：显示可重试空态，不破坏页面壳层。
2. 抽屉提交失败：保持抽屉打开，展示后端错误消息。
3. 删除失败：保留确认弹窗并展示错误消息。
4. 遇到冲突或版本异常：提示用户重新加载后重试。

---

## 9. 测试与验证策略

### 9.1 API 适配验证

重点验证以下行为：

1. 列表、详情、创建、更新、删除的 URL 和方法正确。
2. `PUT` 请求携带完整模型和 `version`。
3. View Model 到接口模型的转换结果符合 swagger 结构。

### 9.2 页面交互验证

至少覆盖：

1. Provider 新建、编辑、删除主链路。
2. Route 多 upstream 展开、fallback 联动、auth 空选拦截。
3. Consumer `BEARER / HEADER / QUERY` 切换时的字段显示与清洗。

### 9.3 工程级验证

完成实现后至少执行：

1. `eslint`
2. `vite build`

确保页面不仅交互正确，也满足工程可编译要求。

---

## 10. 实施原则

1. 优先修复真实业务通路，而不是先堆静态页面。
2. 能通过路由 meta 分流的布局差异，不通过全局样式硬覆盖。
3. 只抽离重复且边界清晰的组件，避免过度抽象。
4. 所有变体态都优先映射为“真实数据 + 前端状态”，不做重复页面。

---

## 11. 最终结论

本次实现以方案 1 为准：直接扩展现有全局布局，在 AI 路由下启用专属视觉与导航结构；三组业务页面真实接入后端 CRUD，并通过局部状态完整覆盖设计稿中的抽屉、确认弹窗和变体态。

该方案满足以下平衡：

1. 保留现有项目骨架，避免新增第二套应用壳层。
2. 将 AI 模块视觉与交互态控制在专属路由范围内。
3. 以真实接口为核心，确保页面不是纯静态还原。
