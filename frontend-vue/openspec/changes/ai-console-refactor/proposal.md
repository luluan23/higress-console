## Why

`frontend-vue` 的主页面目前是空壳，AI 网关管理功能完全缺失。Higress 已提供完整的 Provider/Route/Consumer REST API，需要对应的可视化管理界面，让运维人员和 API 用户都能通过 Web Console 管理 AI 大模型接入配置、监控用量并查看运行状态。

## What Changes

- **新增** Vite 自动导入 `TDesignResolver`，开发端口改为 9009
- **新增** CSS 变量主题系统（深色/浅色），`themeStore` 持久化到 localStorage
- **新增** 左侧分区侧栏（「我的」+「管理」两段，按 `userRole` 权限控制管理菜单显示）
- **新增** `aiRoutes.js` 路由模块，根路由重定向到 `/ai/dashboard`
- **新增** AI 模型管理页（`/ai/provider`）：Provider CRUD，含右侧 Drawer 表单
- **新增** AI 路由管理页（`/ai/route`）：Route CRUD，含右侧 Drawer 表单
- **新增** 消费者 KEY 管理页（`/ai/consumer`）：Consumer CRUD，含右侧 Drawer 表单
- **新增** 用户仪表盘页（`/ai/dashboard`）：4 统计卡片 + ECharts 折线/饼/柱图 + 调用记录表
- **新增** API 端点页（`/ai/endpoint`）：端点信息 + curl 示例 + 支持模型列表
- **新增** 用量明细页（`/ai/usage`）：时间筛选 + ECharts 趋势图 + 分页明细表
- **新增** 系统概览页（`/ai/overview`）：管理员全局 Mock 视图（5 统计卡片 + 堆叠柱图 + 排行表）
- **新增** AI 监控看板页（`/ai/monitor`）：Grafana iframe 嵌入（`GET /dashboard/info?type=AI`）
- **新增** 公共组件：`StatCard`、`CopyText`、`LineChart`、`PieChart`、`BarChart`、`StackedBarChart`
- **新增** `aiStore.js`（Provider/Route/Consumer 列表状态）、`themeStore.js`
- **新增** `src/api/aiApi.js`：Higress AI 接口封装

## Capabilities

### New Capabilities

- `app-shell`: 基础架构——Vite 配置（TDesignResolver + 端口 9009）、CSS 变量主题系统（themeStore）、左侧分区侧栏布局、aiRoutes 路由模块注册
- `ai-provider-management`: AI 模型管理页，对接 `GET/POST/PUT/DELETE /v1/ai/providers`，含搜索/筛选表格 + 右侧 Drawer 表单（Token 列表、Failover 开关）
- `ai-route-management`: AI 路由管理页，对接 `GET/POST/PUT/DELETE /v1/ai/routes`，含搜索表格 + 右侧 Drawer 表单（域名 Tag Input、上游配置、鉴权）
- `ai-consumer-management`: 消费者 KEY 管理页，对接 `GET/POST/PUT/DELETE /v1/consumers`，含搜索表格 + 右侧 Drawer 表单（credentials 动态列表）
- `ai-user-pages`: 用户端三页——仪表盘（ECharts 多图 + 统计卡片）、API 端点（接入说明）、用量明细（筛选 + 分页表 + 趋势图）；仪表盘和用量明细全部 Mock 数据
- `ai-admin-pages`: 管理员端概览两页——系统概览（全 Mock，ECharts 堆叠柱图 + 排行表）、AI 监控看板（Grafana iframe，`GET /dashboard/info?type=AI` + `POST /dashboard/init`）

### Modified Capabilities

<!-- 无现有 specs，此次为全新功能，无需修改已有 capability -->

## Impact

- **文件新增：** `src/views/ai/**`（8 个页面 Vue 文件）、`src/components/charts/**`（4 个图表组件）、`src/components/common/**`（2 个公共组件）、`src/stores/modules/aiStore.js`、`src/stores/modules/themeStore.js`、`src/api/aiApi.js`、`src/router/modules/aiRoutes.js`、`src/styles/theme.scss`
- **文件修改：** `vite.config.js`（添加 TDesignResolver，端口改 9009）、`src/styles/variables.scss`（扩展 CSS 变量）、`src/router/index.js`（导入 aiRoutes，根重定向改为 `/ai/dashboard`）、`src/stores/modules/appStore.js`（添加 `userRole` 字段）
- **新增依赖：** 无（TDesign、ECharts、unplugin-auto-import 均已安装）
- **API 依赖：** Higress 后端 `http://localhost:18001`，用到 `/v1/ai/providers`、`/v1/ai/routes`、`/v1/consumers`、`/dashboard/info`、`/dashboard/init`
