## ADDED Requirements

### Requirement: Route list with search
The AI 路由管理页 SHALL display a table of AI routes fetched from `GET /v1/ai/routes`. Users SHALL be able to filter by route name (text search).

Table columns: 路由名称、域名、上游 Provider（含权重/模型映射摘要）、鉴权状态（启用/关闭）、Fallback（启用/关闭）、操作（编辑/删除）。

#### Scenario: Page loads route list
- **WHEN** the user navigates to `/ai/route`
- **THEN** the table renders with data from `GET /v1/ai/routes`

#### Scenario: Search by route name
- **WHEN** the user types in the search box
- **THEN** the table client-side filters to matching route names

---

### Requirement: Create route via Drawer form
Clicking「添加路由」SHALL open a right-side Drawer. On submission, the app SHALL call `POST /v1/ai/routes`.

Form fields:
- 路由名称（新建可编辑）
- 域名列表（TDesign TagInput，支持多域名输入）
- 上游配置：`upstreams` 动态列表，每项含 provider select（来自 aiStore.providers）、权重数字输入、模型映射 textarea；可增删行
- 鉴权：启用开关；开启后显示 allowedConsumers 多选（来自 `GET /v1/consumers`）
- Fallback：启用开关；开启后显示 fallback Provider select + 策略 select（RAND / SEQ）

#### Scenario: Create with single upstream
- **WHEN** the user fills 路由名称、至少一个域名、至少一条 upstream，then 确认
- **THEN** `POST /v1/ai/routes` is called with valid payload, Drawer closes, table refreshes

#### Scenario: Upstream list requires at least one item
- **WHEN** the user removes all upstream rows and clicks 确认
- **THEN** validation error is shown and the API is NOT called

---

### Requirement: Edit route via Drawer form
Clicking「编辑」SHALL open the Drawer pre-filled with the route's current data. On submission, the app SHALL call `PUT /v1/ai/routes/{name}`. Route 名称 SHALL be read-only.

#### Scenario: Edit upstream weight
- **WHEN** the user changes an upstream weight and clicks 确认
- **THEN** `PUT /v1/ai/routes/{name}` is called with updated upstream data

---

### Requirement: Delete route with confirmation
Clicking「删除」SHALL display a TDesign `Dialog` for confirmation. On confirm, call `DELETE /v1/ai/routes/{name}`.

#### Scenario: Confirm delete
- **WHEN** the user clicks「确认删除」
- **THEN** the route is deleted via API and removed from the table
