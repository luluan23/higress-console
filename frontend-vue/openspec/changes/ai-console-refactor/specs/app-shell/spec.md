## ADDED Requirements

### Requirement: Vite auto-imports TDesign components
Vite SHALL be configured with `TDesignResolver({ library: 'tdesign-vue-next' })` in both `AutoImport` and `Components` plugins so that TDesign components and APIs are available without explicit import statements.

#### Scenario: TDesign component used without import
- **WHEN** a Vue SFC uses a TDesign component (e.g., `<t-button>`) without importing it
- **THEN** the component renders correctly and no TypeScript/lint errors are reported

#### Scenario: Dev server port
- **WHEN** the developer runs `npm run dev`
- **THEN** the dev server starts on port 9009

---

### Requirement: CSS variable theme system
The app SHALL define a dual CSS variable set on `:root[data-theme="dark"]` and `:root[data-theme="light"]` in `src/styles/theme.scss`, covering background colors (`--bg-0`, `--bg-1`, `--bg-2`, `--bg-border`), text colors (`--text-primary`, `--text-secondary`, `--text-muted`), and accent colors (`--color-blue`, `--color-green`, `--color-amber`, `--color-red`, `--color-purple`).

#### Scenario: App starts with system preference dark
- **WHEN** the user's OS uses dark mode and no `theme` key exists in localStorage
- **THEN** `<html data-theme="dark">` is set on page load

#### Scenario: User manually switches theme
- **WHEN** the user clicks the theme toggle icon in the Topbar
- **THEN** `<html data-theme>` attribute switches between `dark` and `light`, and the new value is persisted to `localStorage` under key `theme`

#### Scenario: User returns after manual override
- **WHEN** the user reloads the page and a `theme` value exists in localStorage
- **THEN** that stored theme is applied regardless of system preference

---

### Requirement: Left sidebar with role-based sections
The app shell SHALL render a left sidebar (200px wide) with two sections: **「我的」** (visible to all roles) and **「管理」** (visible only when `userRole === 'admin'`).

「我的」links: 仪表盘 (`/ai/dashboard`), API 端点 (`/ai/endpoint`), 用量明细 (`/ai/usage`).  
「管理」links: AI 模型 (`/ai/provider`), AI 路由 (`/ai/route`), 消费者 KEY (`/ai/consumer`), 系统概览 (`/ai/overview`), 监控看板 (`/ai/monitor`).

#### Scenario: Admin user sees full sidebar
- **WHEN** `appStore.userRole === 'admin'`
- **THEN** both 「我的」and 「管理」sections are visible in the sidebar

#### Scenario: Regular user sees limited sidebar
- **WHEN** `appStore.userRole === 'user'`
- **THEN** only the 「我的」section is visible; 「管理」section is hidden

#### Scenario: Active menu item highlighted
- **WHEN** the current route is `/ai/provider`
- **THEN** the 「AI 模型」menu item is visually highlighted as active

---

### Requirement: userRole resolved on app start
On app startup, the shell SHALL call `GET /user/info`. If the response contains a role field, it SHALL set `appStore.userRole` accordingly. If the endpoint returns 403 or lacks a role field, it SHALL call `GET /v1/ai/providers`; a 403 response means `userRole = 'user'`, otherwise `userRole = 'admin'`.

#### Scenario: /user/info returns admin role
- **WHEN** `GET /user/info` returns `{ role: 'admin' }`
- **THEN** `appStore.userRole` is set to `'admin'`

#### Scenario: /user/info returns 403
- **WHEN** `GET /user/info` returns HTTP 403
- **THEN** the app falls back to `GET /v1/ai/providers`; if that also returns 403, `userRole = 'user'`; otherwise `userRole = 'admin'`

---

### Requirement: AI routes module registered
A `src/router/modules/aiRoutes.js` file SHALL define all AI page routes under `/ai` with lazy-loaded components. The root route SHALL redirect to `/ai/dashboard`.

#### Scenario: Navigating to root
- **WHEN** the user navigates to `/`
- **THEN** the router redirects to `/ai/dashboard`

#### Scenario: AI routes all accessible
- **WHEN** any of the paths `/ai/dashboard`, `/ai/endpoint`, `/ai/usage`, `/ai/provider`, `/ai/route`, `/ai/consumer`, `/ai/overview`, `/ai/monitor` is navigated to
- **THEN** the corresponding page component is loaded and rendered inside the app shell
