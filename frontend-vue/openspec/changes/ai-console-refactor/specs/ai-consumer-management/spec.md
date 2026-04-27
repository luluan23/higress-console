## ADDED Requirements

### Requirement: Consumer list with search
The 消费者 KEY 管理页 SHALL display a table of consumers fetched from `GET /v1/consumers`. Users SHALL be able to filter by name.

Table columns: 消费者名称、认证类型（key-auth）、Key 来源（BEARER/HEADER/QUERY）、Key 数量、操作（编辑/删除）。

#### Scenario: Page loads consumer list
- **WHEN** the user navigates to `/ai/consumer`
- **THEN** the table renders with data from `GET /v1/consumers`

---

### Requirement: Create consumer via Drawer form
Clicking「添加消费者」SHALL open a right-side Drawer. On submission, call `POST /v1/consumers`.

Form fields:
- 消费者名称（新建可编辑）
- credentials 动态列表，每项含：
  - 类型（只读：key-auth）
  - source select：BEARER | HEADER | QUERY
  - key 输入框（密码型）
  - values TagInput
- 可增删 credential 行

#### Scenario: Create consumer with one credential
- **WHEN** the user fills 消费者名称 and at least one credential row, then 确认
- **THEN** `POST /v1/consumers` is called, Drawer closes, table refreshes

#### Scenario: Credential key required
- **WHEN** a credential row's key field is empty and the user clicks 确认
- **THEN** validation error is shown and the API is NOT called

---

### Requirement: Edit consumer via Drawer form
Clicking「编辑」SHALL open the Drawer pre-filled. On submission, call `PUT /v1/consumers/{name}`. 消费者名称 SHALL be read-only.

#### Scenario: Update consumer credentials
- **WHEN** the user adds a new credential row and clicks 确认
- **THEN** `PUT /v1/consumers/{name}` is called with updated credentials

---

### Requirement: Delete consumer with confirmation
Clicking「删除」SHALL show a TDesign `Dialog`. On confirm, call `DELETE /v1/consumers/{name}`.

#### Scenario: Confirm delete
- **WHEN** the user confirms deletion
- **THEN** the consumer is removed via API and the table updates
