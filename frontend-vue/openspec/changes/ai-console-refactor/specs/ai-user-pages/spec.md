## ADDED Requirements

### Requirement: User dashboard with stat cards and charts
The 用户仪表盘页 (`/ai/dashboard`) SHALL display the current user's AI usage overview using static Mock data. Layout top-to-bottom: 4 StatCards → API 端点栏 → 折线图 + 饼图（2:1）→ 柱状图 + 最近调用记录表（1:1）。

StatCards: 总 Token 额度（含进度条）、已消耗 Token（含同比趋势）、剩余 Token（含预计天数副标题）、今日调用次数（含同比趋势）。

Topbar 右上角提供时间粒度切换（小时/日/周/月），切换后重新构造 Mock 数据并调用 `chart.setOption()`。

#### Scenario: Dashboard renders on load
- **WHEN** the user navigates to `/ai/dashboard`
- **THEN** all 4 StatCards, the ECharts line chart, pie chart, bar chart, and recent-calls table are visible with mock data

#### Scenario: Granularity switch updates charts
- **WHEN** the user selects「周」from the granularity switcher
- **THEN** the line chart and bar chart re-render with weekly mock data

#### Scenario: ECharts adapts to theme
- **WHEN** the user switches from dark to light theme
- **THEN** all chart text and axis colors update to match the light theme CSS variables without page reload

---

### Requirement: API endpoint page
The API 端点页 (`/ai/endpoint`) SHALL display the API entry point information for developers.

Sections: API 地址卡片（大号字体 + CopyText）、认证方式说明（Bearer Token / key-auth）、curl 请求示例代码块（语法高亮 + 可复制）、支持的模型列表（从 `GET /v1/ai/providers` 读取，展示 provider name / type / 协议）。

The API endpoint domain SHALL be taken from the first route in `GET /v1/ai/routes`.

#### Scenario: Endpoint page shows real provider list
- **WHEN** the user visits `/ai/endpoint`
- **THEN** the supported models section lists providers from `GET /v1/ai/providers`

#### Scenario: Copy API address
- **WHEN** the user clicks the copy button next to the API address
- **THEN** the full URL is copied to clipboard and a TDesign `MessagePlugin.success('已复制')` toast appears

---

### Requirement: Usage detail page with filters and pagination
The 用量明细页 (`/ai/usage`) SHALL allow the user to view detailed call records filtered by time range and model, using static Mock data.

Components: TDesign DateRangePicker（时间范围）、模型筛选多选下拉、3 汇总卡片（总调用数/总 token/均值延迟）、ECharts 折线趋势图、分页明细表（列：时间/模型/输入 token/输出 token/延迟/状态）。

#### Scenario: Filter by date range
- **WHEN** the user selects a 7-day date range
- **THEN** the trend chart and table regenerate with mock data matching that range size

#### Scenario: Filter by model
- **WHEN** the user selects specific models from the multi-select
- **THEN** only records for those models are shown in the table and trend chart

#### Scenario: Pagination works
- **WHEN** the user clicks page 2 in the table
- **THEN** the next set of mock records is displayed
