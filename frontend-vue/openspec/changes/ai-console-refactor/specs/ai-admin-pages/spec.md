## ADDED Requirements

### Requirement: Admin overview with global mock stats
The 系统概览页 (`/ai/overview`) SHALL display a global admin view using fully static Mock data. Layout: 5 StatCards → 堆叠柱状图 + 消费者 Token 排行表（Top 5）→ 消费者额度使用率进度条列表 + AI 路由状态表。

StatCards: 总 Token 消耗、活跃消费者数、AI 路由数、Provider 数（含异常数副标题）、平均响应时间。

消费者额度进度条颜色阈值: <50% 绿，50–80% 蓝，>80% 琥珀→红。

#### Scenario: Overview renders with mock data
- **WHEN** the admin navigates to `/ai/overview`
- **THEN** all 5 StatCards, the stacked bar chart, consumer ranking table, quota progress bars, and route status table are visible

#### Scenario: Quota progress bar colors correct
- **WHEN** a consumer has used 85% of their quota
- **THEN** the progress bar is displayed in amber or red color

#### Scenario: Stacked bar chart shows per-model breakdown
- **WHEN** the admin views the 系统概览 page
- **THEN** the stacked bar chart shows 7 days of token consumption with each model as a separate stacked series

---

### Requirement: Grafana monitor page with iframe embedding
The AI 监控看板页 (`/ai/monitor`) SHALL embed a Grafana dashboard via `<iframe>` when the dashboard is configured. The page SHALL call `GET /dashboard/info?type=AI` on mount to determine the display state.

**Configured state** (`url` non-empty): Full-height `<iframe>` embedding the `url` from the API response. iframe height SHALL be `calc(100vh - 56px)` with no padding. A「在新标签页打开」button SHALL open `url` in a new tab. A TDesign `Loading` skeleton SHALL be displayed while the iframe is loading.

**Unconfigured state** (`url` empty): An empty-state placeholder with text「Grafana 监控看板尚未初始化」and a「初始化看板」button. Clicking the button SHALL call `POST /dashboard/init`. On success, the page SHALL re-call `GET /dashboard/info` and switch to the configured state.

#### Scenario: Configured dashboard shown
- **WHEN** `GET /dashboard/info?type=AI` returns a non-empty `url`
- **THEN** a full-height `<iframe>` with `src` set to that `url` is rendered

#### Scenario: Loading skeleton during iframe load
- **WHEN** the iframe `src` is set and the content has not yet loaded
- **THEN** a TDesign Loading skeleton overlays the iframe area

#### Scenario: Unconfigured empty state
- **WHEN** `GET /dashboard/info?type=AI` returns an empty `url`
- **THEN** the empty-state message and「初始化看板」button are shown

#### Scenario: Initialize dashboard
- **WHEN** the user clicks「初始化看板」and `POST /dashboard/init` returns success
- **THEN** the page re-fetches `GET /dashboard/info?type=AI` and renders the iframe if `url` is now non-empty

#### Scenario: iframe load timeout
- **WHEN** the iframe `load` event has not fired after 10 seconds
- **THEN** an error message is shown with a「重试」button that resets the iframe `src`

#### Scenario: API fetch error
- **WHEN** `GET /dashboard/info?type=AI` returns an error
- **THEN** an error state is displayed with a「重试」button

#### Scenario: URL source security
- **WHEN** rendering the iframe
- **THEN** the `src` attribute is set to the exact `url` value from the API response; no user-provided or client-constructed URL is used
