## ADDED Requirements

### Requirement: Provider list with search and filter
The AI 模型管理页 SHALL display a paginated table of LLM Providers fetched from `GET /v1/ai/providers`. Users SHALL be able to filter by name (text search), protocol, and status.

Table columns: Provider 名称（含 logo 色块 + 类型副标题）、协议、Token 数量标签（单 Token / 轮询负载均衡 / Failover 备份）、Failover 状态、健康状态（正常绿/限流中琥珀/不可用红，初始为 Mock）、操作（测试/编辑/删除）。

#### Scenario: Page loads provider list
- **WHEN** the user navigates to `/ai/provider`
- **THEN** a loading skeleton is shown, then the table renders with data from `GET /v1/ai/providers`

#### Scenario: Search by name
- **WHEN** the user types a keyword in the search box
- **THEN** the table filters to show only providers whose name contains the keyword (client-side filter)

#### Scenario: Filter by protocol
- **WHEN** the user selects a protocol from the dropdown
- **THEN** only providers matching that protocol are shown

---

### Requirement: Create provider via Drawer form
Clicking「添加模型」SHALL open a right-side Drawer (480px wide). On submission, the app SHALL call `POST /v1/ai/providers` with the form data.

Form fields: Provider 名称（可编辑）、Provider 类型（select）、协议（select）、Token 列表（动态增删，密码型输入框，附说明「多 Token 轮询负载均衡」）、Failover 开关（启用后显示失败阈值数字输入和冷却时间数字输入）。

#### Scenario: Open create Drawer
- **WHEN** the user clicks「添加模型」
- **THEN** a Drawer slides in from the right with an empty form

#### Scenario: Submit valid form
- **WHEN** the user fills all required fields and clicks「确认」
- **THEN** `POST /v1/ai/providers` is called, the Drawer closes, and the table refreshes

#### Scenario: Submit with empty name
- **WHEN** the user submits without filling Provider 名称
- **THEN** a TDesign form validation error is shown and the API is NOT called

---

### Requirement: Edit provider via Drawer form
Clicking「编辑」in the operations column SHALL open the same Drawer pre-filled with the provider's current data. On submission, the app SHALL call `PUT /v1/ai/providers/{name}`.

Provider 名称 SHALL be read-only in edit mode.

#### Scenario: Open edit Drawer
- **WHEN** the user clicks「编辑」on a provider row
- **THEN** the Drawer opens with all fields pre-filled from the provider's current data; 名称 field is disabled

#### Scenario: Update provider
- **WHEN** the user modifies the Failover threshold and clicks「确认」
- **THEN** `PUT /v1/ai/providers/{name}` is called with updated data, Drawer closes, table refreshes

---

### Requirement: Delete provider with confirmation
Clicking「删除」SHALL display a TDesign `Dialog` showing the provider name for confirmation. On confirm, the app SHALL call `DELETE /v1/ai/providers/{name}`.

#### Scenario: Confirm delete
- **WHEN** the user clicks「确认删除」in the confirmation dialog
- **THEN** `DELETE /v1/ai/providers/{name}` is called and the provider is removed from the table

#### Scenario: Cancel delete
- **WHEN** the user clicks「取消」in the confirmation dialog
- **THEN** no API call is made and the provider remains in the table

---

### Requirement: Token count label derived from configuration
The Token 数量 column SHALL display a label derived from the provider's token list and failover setting:
- 1 token → 「单 Token」
- Multiple tokens + failover disabled → 「轮询负载均衡」
- Multiple tokens + failover enabled → 「Failover 备份」

#### Scenario: Single token provider
- **WHEN** a provider has exactly one token and failover is disabled
- **THEN** the Token 数量 column shows「单 Token」
