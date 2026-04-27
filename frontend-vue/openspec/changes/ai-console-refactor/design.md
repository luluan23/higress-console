## Context

`frontend-vue` 是 Higress Console 的 Vue3 前端项目，已安装 Vue3 (^3.3.11)、tdesign-vue-next (^1.19.1)、echarts (^6.0.0)、pinia (^2.1.7)、vue-router (^4.2.5)、axios (^1.6.7)、sass (^1.69.6)、vite (^5.1.4)。

当前状态：主页面空壳（`mainPage.vue` 只有空 `<template>`），`layoutIndex.vue` 有基础的 Sidebar/NavBar/AppMain 骨架，路由只有 `mainpageindex` 一条激活。Vite 使用 `ElementPlusResolver`，端口 9008。

设计文档已完成（`docs/superpowers/specs/2026-04-27-ai-console-refactor-design.md`），包含布局方案、主题系统、页面设计、API 映射等全部细节。

## Goals / Non-Goals

**Goals:**
- 在现有项目骨架上增量实现 AI 控制台功能，不破坏现有文件结构
- 所有新页面统一使用 TDesign 组件 + SCSS CSS 变量，不再引入 Element Plus
- ECharts 图表组件封装为通用 wrapper，供多页面复用
- 真实 CRUD 操作（Provider/Route/Consumer）对接 Higress API；统计/图表数据使用静态 Mock
- 深色/浅色主题切换，跟随系统默认，用户可手动覆盖并持久化

**Non-Goals:**
- 登录页面、插件管理、非 AI 路由/证书管理等其他 Console 功能
- 单元测试和 E2E 测试
- 国际化（i18n）
- 真实的用量统计 API 对接（无对应端点）

## Decisions

### D1: 不重写现有布局，增量扩展 Sidebar

**选择**：在 `layoutIndex.vue` 基础上扩展 Sidebar 内容，而非新建独立布局组件。

**理由**：项目已有 `layout/layoutIndex.vue`（含 Sidebar/NavBar/AppMain 骨架）。完全重写会破坏现有结构，增量扩展只需替换 Sidebar 的菜单列表即可。侧栏菜单项通过 `aiRoutes.js` 的路由 meta 配置（`meta.hidden`, `meta.roles`）驱动显示。

**替代方案**：创建全新 `AiLayout.vue`——放弃，因为会引入重复的布局层，增加路由复杂度。

### D2: CSS 变量主题系统，不用 TDesign 内置 dark mode

**选择**：在 `<html data-theme="dark|light">` 上定义自定义 CSS 变量双套（`src/styles/theme.scss`），ECharts 颜色也从 CSS 变量读取。

**理由**：TDesign 内置暗色模式需要额外的主题包并修改全局配置；自定义 CSS 变量更灵活，能同时覆盖 ECharts 和自定义组件。`themeStore` 监听 `prefers-color-scheme` 作为默认值，localStorage 存用户覆盖值。

**替代方案**：使用 `@tdesign-vue-next/dark-mode`——放弃，依赖额外包且与 ECharts 颜色同步复杂。

### D3: ECharts 选项在页面组件构造，图表组件只负责生命周期

**选择**：`LineChart.vue` 等组件接受完整 `option` 对象作为 prop，内部只负责 init/setOption/resize/dispose。业务数据和图表配置在页面组件里组装。

**理由**：每个图表的 xAxis/yAxis/series 差异大，如果封装进图表组件会导致 props 爆炸。将 option 构造移到页面层，图表组件保持极简（约 40 行），复用性更高。主题切换时通过监听 `themeStore.theme` 重建 ECharts 实例以切换配色。

**替代方案**：为每种图表类型封装专用 props（lineData, pieData...）——放弃，柔性不足。

### D4: Mock 数据集中在 `mockData.js` 文件，按时间粒度返回不同数据集

**选择**：每个有 Mock 需求的页面目录下放 `mockData.js`，导出按参数返回不同数据集的函数（如 `getDashboardMock(granularity)`）。

**理由**：Mock 数据与页面逻辑解耦，后续替换为真实 API 只需改 store action，不需改模板。

### D5: `userRole` 通过 `GET /user/info` 获取，fallback 用 403 判断

**选择**：`appStore` 新增 `userRole: 'user' | 'admin'`，应用启动时调用 `getUserInfo()`，若接口不存在或返回无角色字段，则用 `GET /v1/ai/providers` 是否返回 403 作为 fallback。

**理由**：Higress API 没有明确的角色字段文档，需要防御性处理。侧栏的「管理」分区通过 `v-if="appStore.userRole === 'admin'"` 控制显示。

### D6: API 请求统一走现有 axios 实例，新增 `src/api/aiApi.js`

**选择**：复用项目已有 axios 配置，在 `aiApi.js` 中只导出各接口函数，不重新创建 axios 实例。

**理由**：项目已有 `src/api/` 目录和 axios 配置（含 baseURL、拦截器），保持一致性。

## Risks / Trade-offs

- **[风险] Grafana URL 跨域问题** → `<iframe>` 嵌入 Grafana 可能遇到 `X-Frame-Options` 限制；后端已负责提供可嵌入的 URL（`builtIn: true` 场景由 Higress 管理 Grafana），若仍有问题提供「在新标签页打开」作为降级。
- **[风险] 现有 layoutIndex.vue 耦合度未知** → 需要先 `read_file` 完整阅读后再修改，避免破坏现有逻辑。若改造复杂度超预期，改为新建 `AiSidebar.vue` 单独替换侧栏插槽。
- **[取舍] 全 Mock 数据** → 仪表盘/用量明细/系统概览所有图表数据为静态 Mock，与真实业务不符；但 Higress 后端无对应统计 API，这是合理折衷。
- **[取舍] `TDesignResolver` 自动导入** → 自动导入减少 import 代码但增加构建时间；对于大型组件库可能有命名冲突风险，如遇问题可回退到手动 import。

## Migration Plan

1. 修改 `vite.config.js`（添加 TDesignResolver，port → 9009）
2. 添加 `src/styles/theme.scss` 和扩展 `variables.scss`
3. 修改 `src/router/index.js`（导入 aiRoutes，根重定向）
4. 修改 `src/stores/modules/appStore.js`（添加 userRole）
5. 逐页实现（按优先级 P0 → P3），每页可独立 dev server 验证
6. 每次新增页面后运行 `npm run dev` 验证热重载正常

无数据库迁移，无 API 版本变更，回滚只需 `git revert` 对应提交。

## Open Questions

- `layoutIndex.vue` 的 Sidebar 当前是否有插槽可直接替换菜单内容，还是需要改 `v-for` 循环的数据源？（待阅读源码确认）
- `GET /user/info` 接口是否真实存在于 Higress 后端？需在 `swagger-api-docs.json` 中验证。
- Grafana iframe 嵌入后的 token 认证策略（是否需要传 Higress 登录 cookie 给 Grafana）？
