## 1. 基础设施配置

- [x] 1.1 修改 `vite.config.js`：添加 `TDesignResolver` 到 `AutoImport` 和 `Components`，dev 端口改为 9009
- [x] 1.2 新建 `src/styles/theme.scss`：定义 `dark` / `light` CSS 变量双套（bg、text、accent 色）
- [x] 1.3 修改 `src/styles/variables.scss`：导入 `theme.scss`，确保 CSS 变量全局可用
- [x] 1.4 新建 `src/stores/modules/themeStore.js`：支持 `dark/light/system`，读写 localStorage，启动时设置 `<html data-theme>`
- [x] 1.5 修改 `src/stores/modules/appStore.js`：新增 `userRole: 'user' | 'admin'` 字段和 setter
- [x] 1.6 新建 `src/api/aiApi.js`：封装 Provider / Route / Consumer / User / Dashboard 全部接口函数
- [x] 1.7 新建 `src/stores/modules/aiStore.js`：providers / routes / consumers 列表状态 + fetch/create/update/delete actions

## 2. 路由与布局

- [x] 2.1 新建 `src/router/modules/aiRoutes.js`：定义 `/ai` 下 8 个子路由（懒加载），含 `meta.roles`
- [x] 2.2 修改 `src/router/index.js`：import aiRoutes，加入 `constantRoutes`，根路由 redirect 改为 `/ai/dashboard`
- [x] 2.3 修改 `src/layout/layoutIndex.vue` 或其 Sidebar 子组件：实现「我的」+「管理」两段分区菜单，绑定 `appStore.userRole` 控制「管理」段 `v-if`
- [x] 2.4 在 App 入口（`main.js` 或 `App.vue`）调用 `themeStore.initTheme()` 和 `appStore.resolveUserRole()`

## 3. 公共组件

- [x] 3.1 新建 `src/components/common/StatCard.vue`：props 含 label / value / unit / color / sub / trend / progress，顶部渐变色条
- [x] 3.2 新建 `src/components/common/CopyText.vue`：props 含 text / label / monospace，clipboard 复制 + TDesign toast
- [x] 3.3 新建 `src/components/charts/LineChart.vue`：接受 `option` prop，封装 ECharts init/setOption/resize/dispose + themeStore 联动
- [x] 3.4 新建 `src/components/charts/PieChart.vue`：同上（环形图）
- [x] 3.5 新建 `src/components/charts/BarChart.vue`：同上（柱状图）
- [x] 3.6 新建 `src/components/charts/StackedBarChart.vue`：同上（堆叠柱状图）

## 4. AI 模型管理页（P0）

- [x] 4.1 新建 `src/views/ai/provider/index.vue`：搜索栏 + 协议/状态筛选 + 表格（列见 spec），绑定 `aiStore.providers`
- [x] 4.2 新建 `src/views/ai/provider/ProviderDrawer.vue`：新建/编辑 Drawer 表单（名称/类型/协议/Token 动态列表/Failover 开关）
- [x] 4.3 实现删除确认 Dialog（TDesign `DialogPlugin`），调用 `aiStore.deleteProvider(name)`

## 5. AI 路由管理页（P1）

- [x] 5.1 新建 `src/views/ai/route/index.vue`：搜索栏 + 路由表格，绑定 `aiStore.routes`
- [x] 5.2 新建 `src/views/ai/route/RouteDrawer.vue`：路由名称/域名 TagInput/upstreams 动态列表/鉴权/Fallback 表单
- [x] 5.3 实现 allowedConsumers 多选，从 `aiStore.consumers` 动态加载选项

## 6. 用户仪表盘（P1）

- [x] 6.1 新建 `src/views/ai/dashboard/mockData.js`：按时间粒度返回 4 组 mock 数据集（token 趋势/调用分布/小时量/记录表）
- [x] 6.2 新建 `src/views/ai/dashboard/index.vue`：4 StatCards + API 端点栏 + LineChart + PieChart + BarChart + 调用记录表
- [x] 6.3 实现 Topbar 时间粒度切换，切换时调用 `mockData` 函数并 `chart.setOption()` 更新图表

## 7. 消费者 KEY 管理页（P2）

- [x] 7.1 新建 `src/views/ai/consumer/index.vue`：搜索栏 + 消费者表格，绑定 `aiStore.consumers`
- [x] 7.2 新建 `src/views/ai/consumer/ConsumerDrawer.vue`：消费者名称 + credentials 动态列表（type只读/source/key/values TagInput）

## 8. 系统概览页（P2）

- [x] 8.1 新建 `src/views/ai/overview/mockData.js`：固定 5 卡片统计 + 7 日堆叠柱图数据 + 消费者排行 + 额度进度条数据
- [x] 8.2 新建 `src/views/ai/overview/index.vue`：5 StatCards + StackedBarChart + 排行表 + 额度进度条列表 + 路由状态表
- [x] 8.3 实现额度进度条颜色阈值逻辑（<50% 绿，50–80% 蓝，>80% 琥珀/红）

## 9. AI 监控看板页（P2）

- [x] 9.1 新建 `src/views/ai/monitor/index.vue`：onMounted 调用 `GET /dashboard/info?type=AI`
- [x] 9.2 实现已配置状态：全屏 `<iframe>`（高度 `calc(100vh - 56px)`）+ Loading 骨架 + 「新标签页打开」按钮
- [x] 9.3 实现未配置状态：空状态 + 「初始化看板」按钮（调用 `POST /dashboard/init`，成功后刷新）
- [x] 9.4 实现 iframe 加载超时（10s）+ onError 错误提示 + 「重试」按钮

## 10. API 端点页 + 用量明细页（P3）

- [x] 10.1 新建 `src/views/ai/endpoint/index.vue`：API 地址卡片 + 认证说明 + curl 代码块 + Provider 列表（来自 aiStore）
- [x] 10.2 新建 `src/views/ai/usage/mockData.js`：按时间范围和模型筛选返回 mock 记录集
- [x] 10.3 新建 `src/views/ai/usage/index.vue`：DateRangePicker + 模型多选 + 3 汇总卡片 + LineChart + 分页明细表

## 11. 缺陷修复

- [x] 11.1 在 `src/layout/components/sidebar/index.vue` 底部添加主题切换控件（⊙ 跟随系统 / ☀ 浅色 / 🌙 深色），调用 `themeStore.setTheme()`，选中态持久化显示
- [x] 11.2 修改 4 个 ECharts 封装组件（LineChart / PieChart / BarChart / StackedBarChart）：在 `initChart()` 和 `option` watcher 中强制设置 `backgroundColor: 'transparent'`，使图表画布背景始终透明，以 CSS 卡片背景为准
