# Higress AI Console 前端重构设计规格

**日期：** 2026-04-27  
**状态：** 待实现  
**作者：** GitHub Copilot + 用户协作  
**范围：** `frontend-vue/` 目录下的全部 AI 相关功能页面

---

## 1. 背景与目标

### 1.1 背景

`frontend-vue` 是 Higress Console 的 Vue3 前端项目，目前处于初始状态（主页面为空壳）。项目已安装 Vue3、TDesign、ECharts、Pinia、vue-router 等核心依赖，但尚未实现 AI 功能模块。

### 1.2 目标

- 使用 Vue3 + TDesign + ECharts 实现 Higress AI 网关管理控制台
- 优先实现 AI 大模型管理功能
- 双角色设计（普通用户视图 + 管理员视图，菜单按权限动态显示）
- 支持深色/浅色主题手动切换（跟随系统默认，用户可覆盖）
- 宽松型视觉密度（大卡片、大图表）
- 使用现有 Higress API（`swagger-api-docs.json`，服务器 `http://localhost:18001`）；无对应 API 的数据使用静态 Mock

---

## 2. 技术栈与约束

| 项目 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.3.11 | 核心框架，Composition API + `<script setup>` |
| tdesign-vue-next | ^1.19.1 | 主 UI 组件库（新页面只用 TDesign，不用 Element Plus） |
| echarts | ^6.0.0 | 所有图表可视化 |
| pinia | ^2.1.7 | 状态管理 |
| vue-router | ^4.2.5 | Hash History 路由 |
| axios | ^1.6.7 | HTTP 请求 |
| sass | ^1.69.6 | SCSS，全局注入 `@/styles/main.scss` |
| vite | ^5.1.4 | 构建，base = `goppermission-ui`，dev port 9009 |

**构建约束：**
- `vite.config.js` 需新增 `TDesignResolver` 到 `AutoImport` 和 `Components`
- SCSS 变量文件 `src/styles/variables.scss` 扩展 CSS 变量以支持主题切换

---

## 3. 架构设计

### 3.1 整体结构

```
src/
├── views/
│   ├── ai/
│   │   ├── dashboard/          # 用户仪表盘
│   │   │   └── index.vue
│   │   ├── endpoint/           # API 端点
│   │   │   └── index.vue
│   │   ├── usage/              # 用量明细
│   │   │   └── index.vue
│   │   ├── provider/           # AI 模型管理（管理员）
│   │   │   ├── index.vue
│   │   │   └── ProviderDrawer.vue
│   │   ├── route/              # AI 路由管理（管理员）
│   │   │   ├── index.vue
│   │   │   └── RouteDrawer.vue
│   │   ├── consumer/           # 消费者 KEY 管理（管理员）
│   │   │   ├── index.vue
│   │   │   └── ConsumerDrawer.vue
│   │   ├── overview/           # 系统概览（管理员）
│   │   │   └── index.vue
│   │   └── monitor/            # AI 监控看板，Grafana iframe（管理员）
│   │       └── index.vue
├── components/
│   ├── charts/
│   │   ├── LineChart.vue       # ECharts 折线图封装
│   │   ├── PieChart.vue        # ECharts 饼图封装
│   │   ├── BarChart.vue        # ECharts 柱状图封装
│   │   └── StackedBarChart.vue # ECharts 堆叠柱状图封装
│   └── common/
│       ├── StatCard.vue        # 统计卡片
│       └── CopyText.vue        # 一键复制文本框
├── stores/
│   └── modules/
│       ├── aiStore.js          # AI 相关状态（provider/route/consumer 列表）
│       ├── themeStore.js       # 主题（dark/light/system）
│       └── appStore.js         # 已有，扩展 userRole
├── api/
│   └── aiApi.js               # Higress AI 相关 API 封装
├── router/
│   └── modules/
│       └── aiRoutes.js        # AI 模块路由定义
└── styles/
    ├── variables.scss          # 扩展 CSS 变量（主题 tokens）
    └── theme.scss              # 深色/浅色主题 CSS 变量定义
```

### 3.2 布局结构

使用方案 B：**左侧分区侧栏**（已有 `layout/layoutIndex.vue`，在其基础上扩展 Sidebar 内容）。

```
┌─────────────────────────────────────────────┐
│  Logo (H Higress / AI Console)   [200px]    │  Sidebar
│  ─────────────────────────────────────────  │
│  【我的】                                    │
│    ⊞ 仪表盘        (用户/管理员可见)         │
│    ⇄ API 端点      (用户/管理员可见)         │
│    ◑ 用量明细      (用户/管理员可见)         │
│  ─────                                      │
│  【管理】          (仅管理员可见)             │
│    ⬡ AI 模型                                │
│    ⇢ AI 路由                                │
│    ⚿ 消费者 KEY                             │
│    ▦ 系统概览                               │
│    ◈ 监控看板                               │
│  ─────────────────────────────────────────  │
│  用户头像 + 名称 + 角色                      │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Topbar: 页面标题 + 时间粒度切换 + 主题图标   │  Main
│  ─────────────────────────────────────────  │
│  内容区（滚动）                              │
└─────────────────────────────────────────────┘
```

**权限控制：** `管理` 分组菜单项通过 `userRole === 'admin'` 控制 `v-if` 显示，角色来自 `GET /user/info` 响应。无专用角色字段时，以 `GET /v1/ai/providers` 是否返回 403 作为 fallback 判断。

### 3.3 主题系统

在 `src/styles/theme.scss` 定义 CSS 变量双套：

```scss
:root[data-theme="dark"] {
  --bg-0: #0d1117;
  --bg-1: #161b27;
  --bg-2: #1e2436;
  --bg-border: #2a3247;
  --text-primary: #e6edf3;
  --text-secondary: #8b95a8;
  --text-muted: #4a5568;
  --color-blue: #4f8ef7;
  --color-green: #3ecf8e;
  --color-amber: #f59e0b;
  --color-red: #f87171;
  --color-purple: #a78bfa;
}
:root[data-theme="light"] {
  --bg-0: #f5f7fa;
  --bg-1: #ffffff;
  --bg-2: #f0f2f5;
  --bg-border: #e4e8ef;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-muted: #a0aec0;
  /* color accents 与深色相同 */
}
```

`themeStore` 持久化到 `localStorage`，启动时读取；默认跟随 `prefers-color-scheme`。`data-theme` attribute 写到 `<html>` 元素。

---

## 4. 页面设计

### 4.1 用户仪表盘 (`/ai/dashboard`)

**功能：** 展示当前登录用户的 AI 用量总览。

**布局（上→下）：**
1. **统计卡片行（4 列）**
   - 总 Token 额度（含进度条）
   - 已消耗 Token（含同比趋势）
   - 剩余 Token（含预计可用天数）
   - 今日调用次数（含同比趋势）
2. **API 端点栏**：端点 URL 展示 + 一键复制按钮 + 认证方式标签
3. **图表区（2:1 布局）**
   - 左：Token 消耗趋势折线图（近 7 日，多模型折线，图例）
   - 右：模型调用分布饼图（环形，中心显示模型数量）
4. **底部行（1:1 布局）**
   - 左：每小时调用量柱状图（今日 24 小时）
   - 右：最近调用记录表（模型 / 时间 / 输入 token / 输出 token）

**时间粒度：** Topbar 右上角切换（小时/日/周/月），切换后重新构造图表 mock 数据并调用 `echartsInstance.setOption()`。

**数据来源：**
- API 端点地址：`GET /v1/ai/routes` 列表中取第一条路由的 domain
- 所有统计数字、图表数据：**静态 Mock**（无对应 API）

**ECharts 配置要点：**
- 背景透明（`backgroundColor: 'transparent'`）
- 文字颜色、坐标轴颜色跟随 CSS 变量（在 themeStore watch 中重新 setOption）
- Tooltip 使用暗色浮层样式

### 4.2 API 端点页 (`/ai/endpoint`)

**功能：** 完整展示 API 接入信息，面向开发者。

**布局：**
1. API 地址卡片（大号字体 + 复制按钮）
2. 认证方式说明（Bearer Token，key-auth）
3. 请求示例（`curl` 命令代码块，语法高亮，可复制）
4. 支持的模型列表（从 `GET /v1/ai/providers` 读取，展示 provider name / type / 协议）

### 4.3 用量明细页 (`/ai/usage`)

**功能：** 按时间维度查看详细调用数据。

**布局：**
1. 时间范围选择器（TDesign DateRangePicker）
2. 模型筛选下拉（多选）
3. 汇总统计 3 卡片（总调用数 / 总 token / 均值延迟）
4. 折线图（按选定时间范围展示趋势）
5. 明细数据表（分页，列：时间/模型/输入 token/输出 token/延迟/状态）

**数据：** 全部静态 Mock（随时间范围/模型筛选变化生成不同 Mock 数据集）。

### 4.4 AI 模型管理页 (`/ai/provider`)

**功能：** 管理 LLM Provider（增删改查），对应 `GET/POST /v1/ai/providers`、`PUT/DELETE /v1/ai/providers/{name}`。

**布局：**
1. 搜索栏 + 协议筛选 + 状态筛选 + 「添加模型」按钮
2. Provider 表格
   - 列：Provider 名称（含 logo 色块 + 类型子标题）/ 协议 / Token 数量 / Failover 状态 / 健康状态 / 操作（测试/编辑/删除）
   - 健康状态：正常（绿）/ 限流中（琥珀）/ 不可用（红）；无真实健康检查 API，**初始值固定为 Mock**，点击「测试」按钮后更新为实际探测结果（若后端不支持则保持 Mock）
3. 编辑/新建 Drawer（右侧滑出，480px 宽）

**Drawer 表单字段：**
- 基础：Provider 名称（新建时可编辑，编辑时只读）、Provider 类型（select）、协议（select）
- Token 配置：Token 列表（可动态增删，密码型输入框）+ 说明文字「多 Token 轮询负载均衡」
- Failover：启用开关 / 失败阈值（数字）/ 冷却时间（数字，秒）

**删除确认：** 使用 TDesign `Dialog` 二次确认，显示 provider 名称。

**Token 数量判断：**
- 1 个 → 「单 Token」
- 多个 + Failover 关闭 → 「轮询负载均衡」
- 多个 + Failover 开启 → 「Failover 备份」

### 4.5 AI 路由管理页 (`/ai/route`)

**功能：** 管理 AI 路由，对应 `GET/POST /v1/ai/routes`、`PUT/DELETE /v1/ai/routes/{name}`。

**布局：**
1. 搜索栏 + 「添加路由」按钮
2. 路由表格
   - 列：路由名称 / 域名 / 上游 Provider（含权重/模型映射） / 鉴权状态 / Fallback / 操作
3. 编辑/新建 Drawer

**Drawer 表单字段：**
- 基础：路由名称（新建可编辑）、域名列表（Tag Input）
- 上游配置：`upstreams` 列表（每项含 provider select + 权重 + 模型映射 textarea）、可增删
- 鉴权：启用开关 + allowedConsumers 多选（从 `GET /v1/consumers` 获取列表）
- Fallback：启用开关 + fallback Provider select + 策略（RAND/SEQ）

### 4.6 消费者 KEY 管理页 (`/ai/consumer`)

**功能：** 管理 Consumer（API KEY），对应 `GET/POST /v1/consumers`、`PUT/DELETE /v1/consumers/{name}`。

**布局：**
1. 搜索栏 + 「添加消费者」按钮
2. 消费者表格
   - 列：消费者名称 / 认证类型（key-auth）/ Key 来源（BEARER/HEADER/QUERY）/ Key 数量 / 操作
3. 编辑/新建 Drawer

**Drawer 表单字段：**
- 消费者名称（新建可编辑）
- credentials 列表（每项含：类型 key-auth（只读）/ source select：BEARER|HEADER|QUERY / key 输入框 / values Tag Input）
- 可增删 credential 项

### 4.7 系统概览页 (`/ai/overview`)

**功能：** 管理员全局视角，所有数据为 Mock。

**布局（上→下）：**
1. **汇总卡片行（5 列）**：总 Token 消耗 / 活跃消费者数 / AI 路由数 / Provider 数（含异常数） / 平均响应时间
2. **双列：** 全系统 Token 堆叠柱状图（近 7 日，按模型） + 消费者 Token 用量排行表（Top 5，含 Rank 色块）
3. **双列：** 消费者额度使用率进度条列表（颜色阈值：<50% 绿 / 50-80% 蓝 / >80% 琥珀→红）+ AI 路由状态表

### 4.8 AI 监控看板页 (`/ai/monitor`)

**功能：** 嵌入 Grafana 仪表盘，提供实时 AI 网关监控指标（请求量、延迟、错误率等）。仅管理员可见。

**数据来源：** `GET /dashboard/info?type=AI` 返回 `DashboardInfo { builtIn: boolean, uid: string, url: string }`。

**两种状态：**

1. **已配置（`builtIn: true` 或 `url` 非空）：**
   - 全屏 `<iframe>` 嵌入 `url` 字段指向的 Grafana 页面
   - iframe 高度撑满内容区（`calc(100vh - 56px)`），无内边距
   - 右上角提供「在新标签页打开」按钮，直接跳转 `url`
   - iframe 加载期间显示 TDesign `Loading` 骨架屏占位

2. **未配置（`url` 为空）：**
   - 显示空状态提示：「Grafana 监控看板尚未初始化」
   - 提供「初始化看板」按钮，点击调用 `POST /dashboard/init`
   - 初始化成功后刷新 `GET /dashboard/info` 并切换到嵌入视图

**错误处理：**
- iframe `onError` 或 `load` 超时（10s）→ 显示错误提示 + 「重试」按钮
- `GET /dashboard/info` 接口失败 → 显示错误提示

**安全注意：** `url` 字段值直接来自后端 API，前端不拼接或修改，不接受用户输入。

---

## 5. 共享组件

### 5.1 StatCard.vue

```
Props:
  label: string       # 卡片标签
  value: string|number
  unit?: string       # 单位（K/M/ms 等）
  color: 'blue'|'green'|'amber'|'purple'|'teal'
  sub?: string        # 副标题文本
  trend?: { value: number, direction: 'up'|'down' }
  progress?: number   # 0-100，显示进度条
```

顶部 2px 渐变色条由 `color` prop 决定渐变方向颜色。

### 5.2 LineChart.vue / PieChart.vue / BarChart.vue / StackedBarChart.vue

所有图表组件统一封装：

```
Props:
  option: object      # ECharts option（调用方构造）
  height?: string     # 默认 '200px'
  loading?: boolean
```

内部行为：
- `onMounted` 初始化 ECharts 实例（`echarts.init(el, theme)`）
- 监听 `option` prop 变化，调用 `chart.setOption(option, { notMerge: true })`
- 监听 `themeStore.theme` 变化，销毁并重建实例（切换深浅色）
- `onUnmounted` 调用 `chart.dispose()`
- `ResizeObserver` 监听容器尺寸变化，调用 `chart.resize()`

### 5.3 CopyText.vue

```
Props:
  text: string        # 待复制文本
  label?: string      # 展示用标签（遮掩实际 key 时）
  monospace?: boolean # 等宽字体
```

点击复制按钮后用 `navigator.clipboard.writeText()`，成功显示 TDesign `MessagePlugin.success('已复制')`，2 秒后恢复按钮文字。

---

## 6. 状态管理

### 6.1 aiStore.js

```js
state: {
  providers: [],          // LlmProvider[]，来自 GET /v1/ai/providers
  routes: [],             // AiRoute[]，来自 GET /v1/ai/routes
  consumers: [],          // Consumer[]，来自 GET /v1/consumers
  providersLoading: false,
  routesLoading: false,
  consumersLoading: false,
}
actions:
  fetchProviders()        // GET /v1/ai/providers
  createProvider(data)    // POST /v1/ai/providers
  updateProvider(name, data) // PUT /v1/ai/providers/{name}
  deleteProvider(name)    // DELETE /v1/ai/providers/{name}
  fetchRoutes()           // GET /v1/ai/routes
  createRoute(data)
  updateRoute(name, data)
  deleteRoute(name)
  fetchConsumers()        // GET /v1/consumers
  createConsumer(data)
  updateConsumer(name, data)
  deleteConsumer(name)
```

### 6.2 themeStore.js

```js
state: {
  theme: 'dark' | 'light' | 'system'  // 初始从 localStorage 读取
}
actions:
  setTheme(theme)   // 写 localStorage + 更新 document.documentElement.dataset.theme
  initTheme()       // 启动时调用，处理 system 逻辑
```

---

## 7. API 封装

文件：`src/api/aiApi.js`

基础 axios 实例复用现有项目约定，baseURL 指向 `http://localhost:18001`（开发环境可通过 vite proxy 转发）。

```js
// Provider
export const getProviders = () => request.get('/v1/ai/providers')
export const createProvider = (data) => request.post('/v1/ai/providers', data)
export const updateProvider = (name, data) => request.put(`/v1/ai/providers/${name}`, data)
export const deleteProvider = (name) => request.delete(`/v1/ai/providers/${name}`)

// Route
export const getRoutes = () => request.get('/v1/ai/routes')
export const createRoute = (data) => request.post('/v1/ai/routes', data)
export const updateRoute = (name, data) => request.put(`/v1/ai/routes/${name}`, data)
export const deleteRoute = (name) => request.delete(`/v1/ai/routes/${name}`)

// Consumer
export const getConsumers = () => request.get('/v1/consumers')
export const createConsumer = (data) => request.post('/v1/consumers', data)
export const updateConsumer = (name, data) => request.put(`/v1/consumers/${name}`, data)
export const deleteConsumer = (name) => request.delete(`/v1/consumers/${name}`)

// User
export const getUserInfo = () => request.get('/user/info')
```

---

## 8. 路由设计

文件：`src/router/modules/aiRoutes.js`，在 `src/router/index.js` 中 import 并加入 `constantRoutes`。

```js
{
  path: '/ai',
  component: Layout,
  redirect: '/ai/dashboard',
  children: [
    { path: 'dashboard',  name: 'AiDashboard',  component: () => import('@/views/ai/dashboard/index.vue') },
    { path: 'endpoint',   name: 'AiEndpoint',   component: () => import('@/views/ai/endpoint/index.vue') },
    { path: 'usage',      name: 'AiUsage',      component: () => import('@/views/ai/usage/index.vue') },
    { path: 'provider',   name: 'AiProvider',   component: () => import('@/views/ai/provider/index.vue') },
    { path: 'route',      name: 'AiRoute',      component: () => import('@/views/ai/route/index.vue') },
    { path: 'consumer',   name: 'AiConsumer',   component: () => import('@/views/ai/consumer/index.vue') },
    { path: 'overview',   name: 'AiOverview',   component: () => import('@/views/ai/overview/index.vue') },
    { path: 'monitor',    name: 'AiMonitor',    component: () => import('@/views/ai/monitor/index.vue') },
  ]
}
```

入口重定向：根路由 `/` 改为 redirect 到 `/ai/dashboard`。

---

## 9. vite.config.js 变更

需在现有配置中新增 TDesign 自动导入解析器：

```js
import { TDesignResolver } from 'unplugin-vue-components/resolvers'

// AutoImport resolvers 添加：
TDesignResolver({ library: 'tdesign-vue-next' })

// Components resolvers 添加：
TDesignResolver({ library: 'tdesign-vue-next' })
```

同时将 server port 从 9008 改为 9009（在现有 server 配置中存在两处端口，以 9009 为准）。

---

## 10. Mock 数据策略

以下数据无对应 API，使用静态 Mock：

| 数据 | Mock 位置 | 说明 |
|------|-----------|------|
| Token 额度/消耗/剩余 | `src/views/ai/dashboard/mockData.js` | 固定值 |
| Token 消耗趋势（时序） | 同上 | 按时间粒度返回不同数据集 |
| 模型调用分布 | 同上 | 固定百分比 |
| 每小时调用量 | 同上 | 24 小时正弦波形模拟 |
| 最近调用记录 | 同上 | 固定 10 条 |
| 系统概览汇总 | `src/views/ai/overview/mockData.js` | 固定值 |
| 消费者 Token 排行 | 同上 | 固定 5 条 |
| 消费者额度使用率 | 同上 | 固定 6 条 |
| 平均响应时间 | 同上 | 固定值 |

---

## 11. 实现优先级

| 优先级 | 模块 | 原因 |
|--------|------|------|
| P0 | vite.config.js + 主题系统 + Sidebar | 所有页面的基础 |
| P0 | AI 模型管理页 (`/ai/provider`) | 核心管理功能，有真实 API |
| P1 | 用户仪表盘 (`/ai/dashboard`) | 视觉效果最重要的页面 |
| P1 | AI 路由管理页 (`/ai/route`) | 有真实 API |
| P2 | 消费者 KEY 管理页 (`/ai/consumer`) | 有真实 API |
| P2 | 系统概览页 (`/ai/overview`) | 全 Mock，可快速实现 |
| P2 | AI 监控看板页 (`/ai/monitor`) | 有真实 API，逻辑简单（iframe 嵌入） |
| P3 | API 端点页 + 用量明细页 | 辅助页面 |

---

## 12. 不在本次范围内

- 登录页面（`POST /session/login`）
- 插件管理、路由管理（非 AI）、证书管理等其他 Console 功能
- 单元测试
- 国际化（i18n）
