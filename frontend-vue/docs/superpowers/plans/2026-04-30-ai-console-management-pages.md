# AI Console Management Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build AI provider, AI route, and consumer management pages inside the existing global layout, using real backend CRUD APIs and matching the `design.pen` interactions by `pencil mcp`.

**Architecture:** Extend the current `Layout` and `Sidebar` with an `ai-console` route variant instead of creating a second app shell. Keep API access in a dedicated `aiApi` module, move domain-specific payload mapping into per-page model helpers, and implement Provider, Route, and Consumer as separate page-plus-drawer slices with shared AI UI primitives.

**Tech Stack:** Vue 3, vue-router 4, Pinia, Element Plus, Axios, SCSS, Vitest, Vue Test Utils, jsdom

---

## File Map

### Create

- `frontend-vue/vitest.config.js` — Vitest config with Vue plugin and alias support.
- `frontend-vue/tests/setup.js` — shared test stubs and browser polyfills.
- `frontend-vue/tests/router/aiRoutes.spec.js` — route registration regression test.
- `frontend-vue/tests/layout/aiNavigation.spec.js` — AI layout navigation helper tests.
- `frontend-vue/tests/api/aiApi.spec.js` — API adapter request shape tests.
- `frontend-vue/tests/views/ai/provider/providerModel.spec.js` — provider model mapping tests.
- `frontend-vue/tests/views/ai/provider/ProviderDrawer.spec.js` — provider drawer state tests.
- `frontend-vue/tests/views/ai/route/routeModel.spec.js` — route payload and validation tests.
- `frontend-vue/tests/views/ai/route/RouteDrawer.spec.js` — route drawer expanded-state tests.
- `frontend-vue/tests/views/ai/consumer/consumerModel.spec.js` — consumer credential mapping tests.
- `frontend-vue/tests/views/ai/consumer/ConsumerDrawer.spec.js` — consumer source-toggle tests.
- `frontend-vue/src/router/modules/aiRoutes.js` — `/ai/*` route tree.
- `frontend-vue/src/layout/aiNavigation.js` — AI menu items and route helper.
- `frontend-vue/src/api/aiApi.js` — AI CRUD API adapter.
- `frontend-vue/src/styles/ai-console.scss` — AI console scoped styles.
- `frontend-vue/src/components/ai/PageToolbar.vue` — shared page header and actions wrapper.
- `frontend-vue/src/components/ai/DeleteConfirmDialog.vue` — shared destructive confirmation dialog.
- `frontend-vue/src/components/ai/StatusTag.vue` — shared tag display for state badges.
- `frontend-vue/src/components/ai/provider/TokenListField.vue` — token list editor.
- `frontend-vue/src/components/ai/route/UpstreamListField.vue` — upstream list editor.
- `frontend-vue/src/components/ai/consumer/CredentialListField.vue` — credential list editor.
- `frontend-vue/src/views/ai/provider/providerModel.js` — provider form defaults and payload helpers.
- `frontend-vue/src/views/ai/provider/ProviderDrawer.vue` — provider create/edit drawer.
- `frontend-vue/src/views/ai/route/routeModel.js` — route form defaults and payload helpers.
- `frontend-vue/src/views/ai/route/RouteDrawer.vue` — route create/edit drawer.
- `frontend-vue/src/views/ai/consumer/consumerModel.js` — consumer form defaults and payload helpers.
- `frontend-vue/src/views/ai/consumer/ConsumerDrawer.vue` — consumer create/edit drawer.

### Modify

- `frontend-vue/package.json` — add test commands and test dependencies.
- `frontend-vue/vite.config.js` — keep alias behavior consistent for tests.
- `frontend-vue/src/router/index.js` — register `aiRoutes` in `constantRoutes`.
- `frontend-vue/src/layout/layoutIndex.vue` — switch root container to AI layout variant by route meta.
- `frontend-vue/src/layout/components/sidebar/index.vue` — branch between old sidebar and AI sidebar rendering.
- `frontend-vue/src/styles/main.scss` — import AI scoped stylesheet.
- `frontend-vue/src/views/ai/provider/index.vue` — replace route stub with working provider page.
- `frontend-vue/src/views/ai/route/index.vue` — replace route stub with working route page.
- `frontend-vue/src/views/ai/consumer/index.vue` — replace route stub with working consumer page.

---

### Task 1: Establish Test Harness And Register AI Routes

**Files:**
- Modify: `frontend-vue/package.json`
- Modify: `frontend-vue/vite.config.js`
- Modify: `frontend-vue/src/router/index.js`
- Create: `frontend-vue/vitest.config.js`
- Create: `frontend-vue/tests/setup.js`
- Create: `frontend-vue/tests/router/aiRoutes.spec.js`
- Create: `frontend-vue/src/router/modules/aiRoutes.js`
- Create: `frontend-vue/src/views/ai/provider/index.vue`
- Create: `frontend-vue/src/views/ai/route/index.vue`
- Create: `frontend-vue/src/views/ai/consumer/index.vue`

- [ ] **Step 1: Add Vitest scripts and bootstrap files**

```json
// frontend-vue/package.json
{
  "scripts": {
    "serve": "node apollo && vite --host",
    "build": "node apollo && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore",
    "format": "prettier --write src/",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@rushstack/eslint-patch": "^1.3.3",
    "@vitejs/plugin-vue": "^5.0.4",
    "@vitejs/plugin-vue-jsx": "^3.1.0",
    "@vue/eslint-config-prettier": "^8.0.0",
    "@vue/test-utils": "^2.4.6",
    "eslint": "^8.49.0",
    "eslint-plugin-vue": "^9.17.0",
    "jsdom": "^24.1.3",
    "prettier": "^3.0.3",
    "sql-ddl-to-json-schema": "^5.0.0",
    "unplugin-auto-import": "^0.17.3",
    "unplugin-vue-components": "^0.26.0",
    "urllib": "^4.8.0",
    "vite": "^5.1.4",
    "vitest": "^2.1.8"
  }
}
```

```js
// frontend-vue/vitest.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
  },
})
```

```js
// frontend-vue/tests/setup.js
import { config } from '@vue/test-utils'

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

config.global.stubs = {
  transition: false,
  'router-link': {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>',
  },
  'router-view': true,
}
```

- [ ] **Step 2: Install the new test dependencies**

Run: `npm install`

Expected: exit code `0` and a refreshed lockfile containing `vitest`, `@vue/test-utils`, and `jsdom`.

- [ ] **Step 3: Write the failing AI route registration test**

```js
// frontend-vue/tests/router/aiRoutes.spec.js
import { describe, expect, it } from 'vitest'
import { constantRoutes } from '@/router'

describe('AI route registration', () => {
  it('registers the three AI management pages under /ai', () => {
    const aiRoute = constantRoutes.find((route) => route.path === '/ai')

    expect(aiRoute).toBeDefined()
    expect(aiRoute.children.map((child) => child.name)).toEqual([
      'aiProvider',
      'aiRoute',
      'aiConsumer',
    ])
    expect(
      aiRoute.children.every((child) => child.meta.layoutVariant === 'ai-console')
    ).toBe(true)
  })
})
```

- [ ] **Step 4: Run the route test to verify it fails**

Run: `npx vitest run tests/router/aiRoutes.spec.js`

Expected: FAIL because `constantRoutes.find((route) => route.path === '/ai')` is `undefined`.

- [ ] **Step 5: Implement the AI route module and page stubs**

```js
// frontend-vue/src/router/modules/aiRoutes.js
import Layout from './../../layout/layoutIndex.vue'

const aiRoutes = {
  path: '/ai',
  component: Layout,
  meta: { title: 'AI 管理', layoutVariant: 'ai-console' },
  children: [
    {
      path: 'provider',
      name: 'aiProvider',
      component: () => import('@/views/ai/provider/index.vue'),
      meta: { title: '服务提供者', layoutVariant: 'ai-console' },
    },
    {
      path: 'route',
      name: 'aiRoute',
      component: () => import('@/views/ai/route/index.vue'),
      meta: { title: 'AI 路由管理', layoutVariant: 'ai-console' },
    },
    {
      path: 'consumer',
      name: 'aiConsumer',
      component: () => import('@/views/ai/consumer/index.vue'),
      meta: { title: '消费者管理', layoutVariant: 'ai-console' },
    },
  ],
}

export default aiRoutes
```

```js
// frontend-vue/src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from './../layout/layoutIndex.vue'
import errorPages from './modules/errorPages'
import aiRoutes from './modules/aiRoutes'

export const constantRoutes = [
  {
    path: '/',
    name: 'mainpage',
    component: Layout,
    children: [
      {
        path: 'mainpageindex',
        name: 'mainpageindex',
        component: () => import('./../views/mainPage.vue'),
      },
    ],
  },
  aiRoutes,
  errorPages,
]
```

```vue
// frontend-vue/src/views/ai/provider/index.vue
<template>
  <div class="ai-console-page">
    <h1>服务提供者</h1>
  </div>
</template>

<script setup>
</script>
```

```vue
// frontend-vue/src/views/ai/route/index.vue
<template>
  <div class="ai-console-page">
    <h1>AI 路由管理</h1>
  </div>
</template>

<script setup>
</script>
```

```vue
// frontend-vue/src/views/ai/consumer/index.vue
<template>
  <div class="ai-console-page">
    <h1>消费者管理</h1>
  </div>
</template>

<script setup>
</script>
```

- [ ] **Step 6: Run the route test to verify it passes**

Run: `npx vitest run tests/router/aiRoutes.spec.js`

Expected: PASS with `1 passed`.

- [ ] **Step 7: Commit the route scaffolding**

```bash
git add package.json vite.config.js vitest.config.js tests/setup.js tests/router/aiRoutes.spec.js src/router/index.js src/router/modules/aiRoutes.js src/views/ai/provider/index.vue src/views/ai/route/index.vue src/views/ai/consumer/index.vue
git commit -m "feat: scaffold ai management routes"
```

### Task 2: Add AI Layout Variant And Sidebar Branch

**Files:**
- Modify: `frontend-vue/src/layout/layoutIndex.vue`
- Modify: `frontend-vue/src/layout/components/sidebar/index.vue`
- Modify: `frontend-vue/src/styles/main.scss`
- Create: `frontend-vue/src/layout/aiNavigation.js`
- Create: `frontend-vue/src/styles/ai-console.scss`
- Create: `frontend-vue/tests/layout/aiNavigation.spec.js`

- [ ] **Step 1: Write the failing AI navigation helper test**

```js
// frontend-vue/tests/layout/aiNavigation.spec.js
import { describe, expect, it } from 'vitest'
import { AI_MENU_ITEMS, isAiConsoleRoute } from '@/layout/aiNavigation'

describe('ai navigation', () => {
  it('detects ai-console routes by layoutVariant', () => {
    expect(isAiConsoleRoute({ meta: { layoutVariant: 'ai-console' } })).toBe(true)
    expect(isAiConsoleRoute({ meta: { layoutVariant: 'default' } })).toBe(false)
  })

  it('exposes the fixed menu labels in design order', () => {
    expect(AI_MENU_ITEMS.map((item) => item.title)).toEqual([
      '服务提供者',
      'AI 路由管理',
      '消费者管理',
    ])
  })
})
```

- [ ] **Step 2: Run the navigation test to verify it fails**

Run: `npx vitest run tests/layout/aiNavigation.spec.js`

Expected: FAIL because `@/layout/aiNavigation` does not exist.

- [ ] **Step 3: Implement AI layout helper, sidebar branch, and styles**

```js
// frontend-vue/src/layout/aiNavigation.js
export const AI_MENU_ITEMS = [
  { path: '/ai/provider', title: '服务提供者' },
  { path: '/ai/route', title: 'AI 路由管理' },
  { path: '/ai/consumer', title: '消费者管理' },
]

export function isAiConsoleRoute(route) {
  return route?.meta?.layoutVariant === 'ai-console'
}
```

```vue
// frontend-vue/src/layout/layoutIndex.vue
<template>
  <div>
    <div v-if="'vertical' === layoutMode">
      <div :class="['app-wrapper', classObj, { 'ai-console-layout': isAiConsoleLayout }]">
        <Sidebar class="sidebar-container" />
        <div :class="['main-container', { 'ai-console-main': isAiConsoleLayout }]">
          <div v-if="showNavBar && !isAiConsoleLayout">
            <nav-bar />
          </div>
          <app-main />
        </div>
      </div>
    </div>
    <div v-else-if="'horizontal' === layoutMode">
      <div class="app-wrapper">
        <div v-if="showNavBar && !isAiConsoleLayout">
          <nav-bar />
        </div>
        <app-main />
      </div>
    </div>
    <div v-else>
      <nav-bar v-if="showNavBar && !isAiConsoleLayout" />
      <app-main />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAppStore, useDataStore, useTechStore } from '@/stores'
import settings from './../settings'
import { NavBar, AppMain, Sidebar } from './components'
import { useRouter } from 'vue-router'
import { isAiConsoleRoute } from './aiNavigation'

export default {
  name: 'Layout',
  data() {
    return {
      layoutMode: '',
      showNavBar: false,
      router: useRouter(),
    }
  },
  components: { NavBar, AppMain, Sidebar },
  computed: {
    ...mapState(useAppStore, ['sidebar']),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
      }
    },
    isAiConsoleLayout() {
      return isAiConsoleRoute(this.$route)
    },
  },
  methods: {
    ...mapActions(useTechStore, ['moduleGetUserPermission']),
  },
}
</script>
```

```vue
// frontend-vue/src/layout/components/sidebar/index.vue
<template>
  <div :class="{ 'has-logo': true, mcromenuwarp: true, 'ai-sidebar-shell': isAiConsoleLayout }">
    <logo :collapse="isCollapse" />
    <template v-if="isAiConsoleLayout">
      <nav class="ai-sidebar-nav">
        <div class="ai-sidebar-group-title">AI 管理</div>
        <router-link
          v-for="item in aiMenuItems"
          :key="item.path"
          :to="item.path"
          :class="['ai-sidebar-link', { 'is-active': activeMenu === item.path }]"
        >
          {{ item.title }}
        </router-link>
      </nav>
    </template>
    <el-scrollbar v-else>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="false"
        :default-openeds="openmenu"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in permissionRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useAppStore } from '@/stores'
import Logo from './logo.vue'
import SidebarItem from './sidebarItem.vue'
import { AI_MENU_ITEMS, isAiConsoleRoute } from './../../aiNavigation'

export default {
  components: { SidebarItem, Logo },
  data() {
    return { openmenu: [] }
  },
  computed: {
    ...mapState(useAppStore, ['sidebar', 'permissionRoutes', 'openMenuIndex']),
    aiMenuItems() {
      return AI_MENU_ITEMS
    },
    isAiConsoleLayout() {
      return isAiConsoleRoute(this.$route)
    },
    activeMenu() {
      const route = this.$route
      if (route.meta?.activeMenu) return route.meta.activeMenu
      return route.path
    },
    isCollapse() {
      return !this.sidebar.opened
    },
  },
}
</script>
```

```scss
// frontend-vue/src/styles/main.scss
@import './variablescss.scss';
@import './mixin.scss';
@import './sidebar.scss';
@import './ai-console.scss';
```

```scss
// frontend-vue/src/styles/ai-console.scss
.ai-console-layout {
  background: #f9fafb;
}

.ai-console-main {
  min-height: 100vh;
  background: #f9fafb;
}

.ai-sidebar-shell {
  background: #0a1628;
}

.ai-sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 16px;
}

.ai-sidebar-group-title {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ai-sidebar-link {
  border-radius: 8px;
  color: #e2e8f0;
  padding: 12px 14px;
}

.ai-sidebar-link.is-active {
  background: #1e40af;
  color: #fff;
}

.ai-console-page {
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px 32px 32px;
}
```

- [ ] **Step 4: Run the layout tests to verify they pass**

Run: `npx vitest run tests/layout/aiNavigation.spec.js tests/router/aiRoutes.spec.js`

Expected: PASS with `2 files passed`.

- [ ] **Step 5: Commit the AI layout shell changes**

```bash
git add src/layout/layoutIndex.vue src/layout/components/sidebar/index.vue src/layout/aiNavigation.js src/styles/main.scss src/styles/ai-console.scss tests/layout/aiNavigation.spec.js
git commit -m "feat: add ai layout variant and sidebar"
```

### Task 3: Add AI API Adapter And Shared AI Components

**Files:**
- Create: `frontend-vue/src/api/aiApi.js`
- Create: `frontend-vue/src/components/ai/PageToolbar.vue`
- Create: `frontend-vue/src/components/ai/DeleteConfirmDialog.vue`
- Create: `frontend-vue/src/components/ai/StatusTag.vue`
- Create: `frontend-vue/tests/api/aiApi.spec.js`

- [ ] **Step 1: Write the failing AI API adapter test**

```js
// frontend-vue/tests/api/aiApi.spec.js
import { beforeEach, describe, expect, it, vi } from 'vitest'

const request = vi.fn(() => Promise.resolve({ success: true }))

vi.mock('@/utils/request', () => ({
  default: request,
}))

import {
  listProviders,
  updateAiRoute,
  deleteConsumer,
} from '@/api/aiApi'

describe('ai api', () => {
  beforeEach(() => {
    request.mockClear()
  })

  it('calls the provider list endpoint with query params', async () => {
    await listProviders({ query: 'qwen' })

    expect(request).toHaveBeenCalledWith({
      url: '/v1/ai/providers',
      method: 'GET',
      params: { query: 'qwen' },
    })
  })

  it('calls the route update endpoint with the route name in the path', async () => {
    const payload = { name: 'chat-route', version: '3' }
    await updateAiRoute(payload)

    expect(request).toHaveBeenCalledWith({
      url: '/v1/ai/routes/chat-route',
      method: 'PUT',
      data: payload,
    })
  })

  it('calls the consumer delete endpoint with the consumer name', async () => {
    await deleteConsumer('mobile-client')

    expect(request).toHaveBeenCalledWith({
      url: '/v1/consumers/mobile-client',
      method: 'DELETE',
    })
  })
})
```

- [ ] **Step 2: Run the API test to verify it fails**

Run: `npx vitest run tests/api/aiApi.spec.js`

Expected: FAIL because `@/api/aiApi` does not exist.

- [ ] **Step 3: Implement the AI API adapter and shared UI primitives**

```js
// frontend-vue/src/api/aiApi.js
import request from '@/utils/request'

export function listProviders(params) {
  return request({ url: '/v1/ai/providers', method: 'GET', params })
}

export function getProvider(name) {
  return request({ url: `/v1/ai/providers/${name}`, method: 'GET' })
}

export function createProvider(data) {
  return request({ url: '/v1/ai/providers', method: 'POST', data })
}

export function updateProvider(data) {
  return request({ url: `/v1/ai/providers/${data.name}`, method: 'PUT', data })
}

export function deleteProvider(name) {
  return request({ url: `/v1/ai/providers/${name}`, method: 'DELETE' })
}

export function listAiRoutes(params) {
  return request({ url: '/v1/ai/routes', method: 'GET', params })
}

export function getAiRoute(name) {
  return request({ url: `/v1/ai/routes/${name}`, method: 'GET' })
}

export function createAiRoute(data) {
  return request({ url: '/v1/ai/routes', method: 'POST', data })
}

export function updateAiRoute(data) {
  return request({ url: `/v1/ai/routes/${data.name}`, method: 'PUT', data })
}

export function deleteAiRoute(name) {
  return request({ url: `/v1/ai/routes/${name}`, method: 'DELETE' })
}

export function listConsumers(params) {
  return request({ url: '/v1/consumers', method: 'GET', params })
}

export function getConsumer(name) {
  return request({ url: `/v1/consumers/${name}`, method: 'GET' })
}

export function createConsumer(data) {
  return request({ url: '/v1/consumers', method: 'POST', data })
}

export function updateConsumer(data) {
  return request({ url: `/v1/consumers/${data.name}`, method: 'PUT', data })
}

export function deleteConsumer(name) {
  return request({ url: `/v1/consumers/${name}`, method: 'DELETE' })
}
```

```vue
// frontend-vue/src/components/ai/PageToolbar.vue
<template>
  <div class="ai-page-toolbar">
    <div>
      <h1 class="ai-page-toolbar__title">{{ title }}</h1>
      <p v-if="description" class="ai-page-toolbar__description">{{ description }}</p>
    </div>
    <div class="ai-page-toolbar__actions">
      <slot name="filters" />
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
```

```vue
// frontend-vue/src/components/ai/DeleteConfirmDialog.vue
<template>
  <el-dialog :model-value="visible" width="480px" @close="$emit('cancel')">
    <template #header>
      <div class="ai-confirm-title">{{ title }}</div>
    </template>
    <p class="ai-confirm-message">{{ message }}</p>
    <template #footer>
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="danger" @click="$emit('confirm')">确认删除</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
})

defineEmits(['cancel', 'confirm'])
</script>
```

```vue
// frontend-vue/src/components/ai/StatusTag.vue
<template>
  <span :class="['ai-status-tag', `is-${tone}`]">{{ label }}</span>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  tone: { type: String, default: 'default' },
})
</script>
```

- [ ] **Step 4: Run the API adapter tests to verify they pass**

Run: `npx vitest run tests/api/aiApi.spec.js`

Expected: PASS with `3 passed`.

- [ ] **Step 5: Commit the adapter and shared AI components**

```bash
git add src/api/aiApi.js src/components/ai/PageToolbar.vue src/components/ai/DeleteConfirmDialog.vue src/components/ai/StatusTag.vue tests/api/aiApi.spec.js
git commit -m "feat: add ai api adapter and shared ui primitives"
```

### Task 4: Implement The Provider Page Slice

**Files:**
- Modify: `frontend-vue/src/views/ai/provider/index.vue`
- Create: `frontend-vue/src/views/ai/provider/providerModel.js`
- Create: `frontend-vue/src/views/ai/provider/ProviderDrawer.vue`
- Create: `frontend-vue/src/components/ai/provider/TokenListField.vue`
- Create: `frontend-vue/tests/views/ai/provider/providerModel.spec.js`
- Create: `frontend-vue/tests/views/ai/provider/ProviderDrawer.spec.js`

- [ ] **Step 1: Write the failing provider model and drawer tests**

```js
// frontend-vue/tests/views/ai/provider/providerModel.spec.js
import { describe, expect, it } from 'vitest'
import {
  createProviderForm,
  getTokenModeLabel,
  toProviderPayload,
} from '@/views/ai/provider/providerModel'

describe('providerModel', () => {
  it('removes the failover block when failover is disabled', () => {
    const form = createProviderForm()
    form.name = 'qwen-prod'
    form.type = 'qwen'
    form.protocol = 'openai/v1'
    form.tokens = ['token-1']

    const payload = toProviderPayload(form)

    expect(payload).toEqual({
      name: 'qwen-prod',
      type: 'qwen',
      protocol: 'openai/v1',
      proxyName: '',
      tokens: ['token-1'],
      rawConfigs: {},
    })
  })

  it('labels multiple tokens with failover enabled as Failover 备份', () => {
    expect(
      getTokenModeLabel({
        tokens: ['token-1', 'token-2'],
        tokenFailoverConfig: { enabled: true },
      })
    ).toBe('Failover 备份')
  })
})
```

```js
// frontend-vue/tests/views/ai/provider/ProviderDrawer.spec.js
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import ProviderDrawer from '@/views/ai/provider/ProviderDrawer.vue'
import { createProviderForm } from '@/views/ai/provider/providerModel'

describe('ProviderDrawer', () => {
  it('shows advanced failover fields for qwen providers when failover is enabled', async () => {
    const form = createProviderForm()
    form.type = 'qwen'
    form.tokens = ['token-1', 'token-2']
    form.failoverEnabled = true

    const wrapper = mount(ProviderDrawer, {
      props: {
        visible: true,
        mode: 'create',
        modelValue: form,
        saving: false,
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('失败阈值')
    expect(wrapper.text()).toContain('健康检查模型')
  })
})
```

- [ ] **Step 2: Run the provider tests to verify they fail**

Run: `npx vitest run tests/views/ai/provider/providerModel.spec.js tests/views/ai/provider/ProviderDrawer.spec.js`

Expected: FAIL because `providerModel.js` and `ProviderDrawer.vue` do not exist.

- [ ] **Step 3: Implement the provider model, token field, drawer, and page**

```js
// frontend-vue/src/views/ai/provider/providerModel.js
export function createProviderForm() {
  return {
    name: '',
    version: '',
    type: 'qwen',
    protocol: 'openai/v1',
    proxyName: '',
    tokens: [''],
    failoverEnabled: false,
    failureThreshold: 3,
    successThreshold: 1,
    healthCheckInterval: 30,
    healthCheckTimeout: 10,
    healthCheckModel: '',
    rawConfigs: {},
  }
}

export function providerFromApi(provider) {
  return {
    name: provider.name || '',
    version: provider.version || '',
    type: provider.type || 'qwen',
    protocol: provider.protocol || 'openai/v1',
    proxyName: provider.proxyName || '',
    tokens: provider.tokens?.length ? [...provider.tokens] : [''],
    failoverEnabled: provider.tokenFailoverConfig?.enabled || false,
    failureThreshold: provider.tokenFailoverConfig?.failureThreshold ?? 3,
    successThreshold: provider.tokenFailoverConfig?.successThreshold ?? 1,
    healthCheckInterval: provider.tokenFailoverConfig?.healthCheckInterval ?? 30,
    healthCheckTimeout: provider.tokenFailoverConfig?.healthCheckTimeout ?? 10,
    healthCheckModel: provider.tokenFailoverConfig?.healthCheckModel || '',
    rawConfigs: provider.rawConfigs || {},
  }
}

export function toProviderPayload(form) {
  const payload = {
    name: form.name.trim(),
    type: form.type,
    protocol: form.protocol,
    proxyName: form.proxyName || '',
    tokens: form.tokens.map((token) => token.trim()).filter(Boolean),
    rawConfigs: form.rawConfigs || {},
  }

  if (form.version) payload.version = form.version

  if (form.failoverEnabled) {
    payload.tokenFailoverConfig = {
      enabled: true,
      failureThreshold: Number(form.failureThreshold),
      successThreshold: Number(form.successThreshold),
      healthCheckInterval: Number(form.healthCheckInterval),
      healthCheckTimeout: Number(form.healthCheckTimeout),
      healthCheckModel: form.healthCheckModel,
    }
  }

  return payload
}

export function getTokenModeLabel(provider) {
  const tokenCount = provider.tokens?.length || 0
  if (tokenCount <= 1) return '单 Token'
  return provider.tokenFailoverConfig?.enabled ? 'Failover 备份' : '轮询负载均衡'
}
```

```vue
// frontend-vue/src/components/ai/provider/TokenListField.vue
<template>
  <div class="ai-array-field">
    <div v-for="(token, index) in modelValue" :key="index" class="ai-array-field__row">
      <el-input :model-value="token" show-password @update:model-value="updateToken(index, $event)" />
      <el-button text type="danger" @click="removeToken(index)">删除</el-button>
    </div>
    <el-button @click="addToken">新增 Token</el-button>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Array, required: true } })
const emit = defineEmits(['update:modelValue'])

function addToken() {
  emit('update:modelValue', [...props.modelValue, ''])
}

function removeToken(index) {
  emit('update:modelValue', props.modelValue.filter((_, current) => current !== index))
}

function updateToken(index, value) {
  emit(
    'update:modelValue',
    props.modelValue.map((token, current) => (current === index ? value : token))
  )
}
</script>
```

```vue
// frontend-vue/src/views/ai/provider/ProviderDrawer.vue
<template>
  <el-drawer :model-value="visible" size="560px" @close="$emit('close')">
    <template #header>{{ mode === 'create' ? '创建服务提供者' : '编辑服务提供者' }}</template>
    <div class="ai-drawer-body">
      <el-form label-position="top">
        <el-form-item label="Provider 名称">
          <el-input :model-value="localModel.name" :disabled="mode === 'edit'" @update:model-value="updateField('name', $event)" />
        </el-form-item>
        <el-form-item label="Provider 类型">
          <el-select :model-value="localModel.type" @update:model-value="updateField('type', $event)">
            <el-option label="Qwen" value="qwen" />
            <el-option label="OpenAI" value="openai" />
            <el-option label="Claude" value="claude" />
          </el-select>
        </el-form-item>
        <el-form-item label="协议">
          <el-select :model-value="localModel.protocol" @update:model-value="updateField('protocol', $event)">
            <el-option label="openai/v1" value="openai/v1" />
            <el-option label="original" value="original" />
          </el-select>
        </el-form-item>
        <el-form-item label="Tokens">
          <TokenListField :model-value="localModel.tokens" @update:model-value="updateField('tokens', $event)" />
        </el-form-item>
        <el-form-item label="启用 Token Failover">
          <el-switch :model-value="localModel.failoverEnabled" @update:model-value="updateField('failoverEnabled', $event)" />
        </el-form-item>
        <template v-if="showAdvancedFailover">
          <el-form-item label="失败阈值">
            <el-input-number :model-value="localModel.failureThreshold" :min="1" @update:model-value="updateField('failureThreshold', $event)" />
          </el-form-item>
          <el-form-item label="成功阈值">
            <el-input-number :model-value="localModel.successThreshold" :min="1" @update:model-value="updateField('successThreshold', $event)" />
          </el-form-item>
          <el-form-item label="健康检查模型">
            <el-input :model-value="localModel.healthCheckModel" @update:model-value="updateField('healthCheckModel', $event)" />
          </el-form-item>
        </template>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" :loading="saving" @click="$emit('submit', localModel)">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import TokenListField from '@/components/ai/provider/TokenListField.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  modelValue: { type: Object, required: true },
  saving: { type: Boolean, default: false },
})

defineEmits(['close', 'submit'])

const localModel = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (value) => {
    localModel.value = { ...value }
  },
  { deep: true, immediate: true }
)

const showAdvancedFailover = computed(
  () => localModel.value.type === 'qwen' && localModel.value.failoverEnabled
)

function updateField(field, value) {
  localModel.value = { ...localModel.value, [field]: value }
}
</script>
```

```vue
// frontend-vue/src/views/ai/provider/index.vue
<template>
  <div class="ai-console-page">
    <PageToolbar title="服务提供者" description="管理大模型服务提供者和 Token 策略">
      <template #filters>
        <el-input v-model="query" placeholder="搜索 Provider" clearable @change="loadProviders" />
      </template>
      <template #actions>
        <el-button type="primary" @click="openCreate">新增服务提供者</el-button>
      </template>
    </PageToolbar>

    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="name" label="Provider 名称" min-width="180" />
      <el-table-column prop="type" label="类型" width="140" />
      <el-table-column prop="protocol" label="协议" width="140" />
      <el-table-column label="Token 模式" width="160">
        <template #default="scope">{{ scope.row.tokenModeLabel }}</template>
      </el-table-column>
      <el-table-column label="状态" width="140">
        <template #default>
          <StatusTag label="未检测" tone="default" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button text @click="openEdit(scope.row.name)">编辑</el-button>
          <el-button text type="danger" @click="openDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <ProviderDrawer
      :visible="drawerVisible"
      :mode="drawerMode"
      :model-value="formModel"
      :saving="saving"
      @close="drawerVisible = false"
      @submit="submitProvider"
    />

    <DeleteConfirmDialog
      :visible="deleteVisible"
      title="删除服务提供者"
      :message="deleteMessage"
      @cancel="deleteVisible = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { deleteProvider, getProvider, listProviders, createProvider, updateProvider } from '@/api/aiApi'
import PageToolbar from '@/components/ai/PageToolbar.vue'
import DeleteConfirmDialog from '@/components/ai/DeleteConfirmDialog.vue'
import StatusTag from '@/components/ai/StatusTag.vue'
import ProviderDrawer from './ProviderDrawer.vue'
import { createProviderForm, providerFromApi, toProviderPayload, getTokenModeLabel } from './providerModel'

const loading = ref(false)
const saving = ref(false)
const query = ref('')
const rows = ref([])
const drawerVisible = ref(false)
const drawerMode = ref('create')
const formModel = ref(createProviderForm())
const deleteVisible = ref(false)
const deletingName = ref('')

const deleteMessage = computed(() => `删除 ${deletingName.value} 后将无法恢复。`)

async function loadProviders() {
  loading.value = true
  try {
    const response = await listProviders(query.value ? { query: query.value } : undefined)
    const providers = response?.data || []
    rows.value = providers.map((provider) => ({
      ...provider,
      tokenModeLabel: getTokenModeLabel(provider),
    }))
  } finally {
    loading.value = false
  }
}

function openCreate() {
  drawerMode.value = 'create'
  formModel.value = createProviderForm()
  drawerVisible.value = true
}

async function openEdit(name) {
  const response = await getProvider(name)
  formModel.value = providerFromApi(response.data)
  drawerMode.value = 'edit'
  drawerVisible.value = true
}

function openDelete(row) {
  deletingName.value = row.name
  deleteVisible.value = true
}

async function submitProvider(model) {
  saving.value = true
  try {
    const payload = toProviderPayload(model)
    if (drawerMode.value === 'create') {
      await createProvider(payload)
    } else {
      await updateProvider(payload)
    }
    drawerVisible.value = false
    ElMessage.success('保存成功')
    await loadProviders()
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  await deleteProvider(deletingName.value)
  deleteVisible.value = false
  ElMessage.success('删除成功')
  await loadProviders()
}

onMounted(loadProviders)
</script>
```

- [ ] **Step 4: Run the provider tests to verify they pass**

Run: `npx vitest run tests/views/ai/provider/providerModel.spec.js tests/views/ai/provider/ProviderDrawer.spec.js`

Expected: PASS with `3 passed`.

- [ ] **Step 5: Commit the provider slice**

```bash
git add src/views/ai/provider/index.vue src/views/ai/provider/providerModel.js src/views/ai/provider/ProviderDrawer.vue src/components/ai/provider/TokenListField.vue tests/views/ai/provider/providerModel.spec.js tests/views/ai/provider/ProviderDrawer.spec.js
git commit -m "feat: implement provider management page"
```

### Task 5: Implement The Route Page Slice

**Files:**
- Modify: `frontend-vue/src/views/ai/route/index.vue`
- Create: `frontend-vue/src/views/ai/route/routeModel.js`
- Create: `frontend-vue/src/views/ai/route/RouteDrawer.vue`
- Create: `frontend-vue/src/components/ai/route/UpstreamListField.vue`
- Create: `frontend-vue/tests/views/ai/route/routeModel.spec.js`
- Create: `frontend-vue/tests/views/ai/route/RouteDrawer.spec.js`

- [ ] **Step 1: Write the failing route model and drawer tests**

```js
// frontend-vue/tests/views/ai/route/routeModel.spec.js
import { describe, expect, it } from 'vitest'
import { createRouteForm, toRoutePayload, validateRouteForm } from '@/views/ai/route/routeModel'

describe('routeModel', () => {
  it('converts model mapping rows to an object payload', () => {
    const form = createRouteForm()
    form.name = 'chat-route'
    form.domains = ['chat.example.com']
    form.upstreams = [
      {
        provider: 'qwen-prod',
        weight: 100,
        modelMappingRows: [{ source: 'gpt-4o', target: 'qwen-max' }],
      },
    ]

    expect(toRoutePayload(form)).toEqual({
      name: 'chat-route',
      domains: ['chat.example.com'],
      pathPredicate: { matchType: 'PRE', matchValue: '/', caseSensitive: false },
      upstreams: [
        {
          provider: 'qwen-prod',
          weight: 100,
          modelMapping: { 'gpt-4o': 'qwen-max' },
        },
      ],
      authConfig: { enabled: false, allowedConsumers: [] },
      fallbackConfig: { enabled: false, fallbackStrategy: 'RAND', upstreams: [], responseCodes: [] },
    })
  })

  it('returns a validation error when auth is enabled without allowed consumers', () => {
    const form = createRouteForm()
    form.authEnabled = true

    expect(validateRouteForm(form)).toContain('请选择允许访问的消费者')
  })
})
```

```js
// frontend-vue/tests/views/ai/route/RouteDrawer.spec.js
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import RouteDrawer from '@/views/ai/route/RouteDrawer.vue'
import { createRouteForm } from '@/views/ai/route/routeModel'

describe('RouteDrawer', () => {
  it('shows the fallback section when fallback is enabled', () => {
    const form = createRouteForm()
    form.fallbackEnabled = true

    const wrapper = mount(RouteDrawer, {
      props: {
        visible: true,
        modelValue: form,
        consumerOptions: ['mobile-client'],
        providerOptions: ['qwen-prod'],
        saving: false,
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('Fallback 策略')
    expect(wrapper.text()).toContain('Fallback Upstreams')
  })
})
```

- [ ] **Step 2: Run the route tests to verify they fail**

Run: `npx vitest run tests/views/ai/route/routeModel.spec.js tests/views/ai/route/RouteDrawer.spec.js`

Expected: FAIL because `routeModel.js` and `RouteDrawer.vue` do not exist.

- [ ] **Step 3: Implement the route model, upstream field, drawer, and page**

```js
// frontend-vue/src/views/ai/route/routeModel.js
export function createRouteForm() {
  return {
    name: '',
    version: '',
    domains: [''],
    pathPredicate: { matchType: 'PRE', matchValue: '/', caseSensitive: false },
    upstreams: [{ provider: '', weight: 100, modelMappingRows: [] }],
    authEnabled: false,
    allowedConsumers: [],
    fallbackEnabled: false,
    fallbackStrategy: 'RAND',
    fallbackUpstreams: [],
    fallbackResponseCodes: [],
  }
}

export function routeFromApi(route) {
  return {
    name: route.name || '',
    version: route.version || '',
    domains: route.domains?.length ? [...route.domains] : [''],
    pathPredicate: route.pathPredicate || { matchType: 'PRE', matchValue: '/', caseSensitive: false },
    upstreams: (route.upstreams || []).map((upstream) => ({
      provider: upstream.provider,
      weight: upstream.weight,
      modelMappingRows: Object.entries(upstream.modelMapping || {}).map(([source, target]) => ({ source, target })),
    })),
    authEnabled: route.authConfig?.enabled || false,
    allowedConsumers: route.authConfig?.allowedConsumers || [],
    fallbackEnabled: route.fallbackConfig?.enabled || false,
    fallbackStrategy: route.fallbackConfig?.fallbackStrategy || 'RAND',
    fallbackUpstreams: route.fallbackConfig?.upstreams || [],
    fallbackResponseCodes: route.fallbackConfig?.responseCodes || [],
  }
}

export function validateRouteForm(form) {
  const errors = []
  if (!form.name.trim()) errors.push('请输入路由名称')
  if (!form.domains.map((item) => item.trim()).filter(Boolean).length) errors.push('至少填写一个域名')
  if (!form.upstreams.length) errors.push('至少配置一个上游 Provider')
  if (form.authEnabled && !form.allowedConsumers.length) errors.push('请选择允许访问的消费者')
  if (form.fallbackEnabled && form.fallbackStrategy === 'SEQ' && form.fallbackUpstreams.length > 1) {
    errors.push('SEQ 模式下只允许一个 Fallback Upstream')
  }
  return errors
}

export function toRoutePayload(form) {
  return {
    ...(form.version ? { version: form.version } : {}),
    name: form.name.trim(),
    domains: form.domains.map((item) => item.trim()).filter(Boolean),
    pathPredicate: form.pathPredicate,
    upstreams: form.upstreams.map((upstream) => ({
      provider: upstream.provider,
      weight: Number(upstream.weight),
      modelMapping: upstream.modelMappingRows.reduce((result, row) => {
        if (row.source && row.target) result[row.source] = row.target
        return result
      }, {}),
    })),
    authConfig: {
      enabled: form.authEnabled,
      allowedConsumers: form.allowedConsumers,
    },
    fallbackConfig: {
      enabled: form.fallbackEnabled,
      fallbackStrategy: form.fallbackStrategy,
      upstreams: form.fallbackUpstreams,
      responseCodes: form.fallbackResponseCodes,
    },
  }
}
```

```vue
// frontend-vue/src/components/ai/route/UpstreamListField.vue
<template>
  <div class="ai-array-field">
    <div v-for="(item, index) in modelValue" :key="index" class="ai-array-field__card">
      <el-select :model-value="item.provider" placeholder="选择 Provider" @update:model-value="updateUpstream(index, 'provider', $event)">
        <el-option v-for="option in providerOptions" :key="option" :label="option" :value="option" />
      </el-select>
      <el-input-number :model-value="item.weight" :min="1" @update:model-value="updateUpstream(index, 'weight', $event)" />
      <el-button text type="danger" @click="removeUpstream(index)">删除</el-button>
    </div>
    <el-button @click="addUpstream">新增 Upstream</el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
  providerOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

function addUpstream() {
  emit('update:modelValue', [...props.modelValue, { provider: '', weight: 100, modelMappingRows: [] }])
}

function removeUpstream(index) {
  emit('update:modelValue', props.modelValue.filter((_, current) => current !== index))
}

function updateUpstream(index, field, value) {
  emit(
    'update:modelValue',
    props.modelValue.map((item, current) =>
      current === index ? { ...item, [field]: value } : item
    )
  )
}
</script>
```

```vue
// frontend-vue/src/views/ai/route/RouteDrawer.vue
<template>
  <el-drawer :model-value="visible" size="560px" @close="$emit('close')">
    <template #header>{{ mode === 'create' ? '创建 AI 路由' : '编辑 AI 路由' }}</template>
    <el-form label-position="top">
      <el-form-item label="路由名称">
        <el-input :model-value="localModel.name" :disabled="mode === 'edit'" @update:model-value="updateField('name', $event)" />
      </el-form-item>
      <el-form-item label="域名">
        <el-select :model-value="localModel.domains" multiple allow-create filterable default-first-option @update:model-value="updateField('domains', $event)" />
      </el-form-item>
      <el-form-item label="上游 Provider">
        <UpstreamListField :model-value="localModel.upstreams" :provider-options="providerOptions" @update:model-value="updateField('upstreams', $event)" />
      </el-form-item>
      <el-form-item label="启用鉴权">
        <el-switch :model-value="localModel.authEnabled" @update:model-value="updateField('authEnabled', $event)" />
      </el-form-item>
      <el-form-item v-if="localModel.authEnabled" label="允许访问的消费者">
        <el-select :model-value="localModel.allowedConsumers" multiple @update:model-value="updateField('allowedConsumers', $event)">
          <el-option v-for="option in consumerOptions" :key="option" :label="option" :value="option" />
        </el-select>
      </el-form-item>
      <el-form-item label="启用 Fallback">
        <el-switch :model-value="localModel.fallbackEnabled" @update:model-value="updateField('fallbackEnabled', $event)" />
      </el-form-item>
      <template v-if="localModel.fallbackEnabled">
        <el-form-item label="Fallback 策略">
          <el-select :model-value="localModel.fallbackStrategy" @update:model-value="updateField('fallbackStrategy', $event)">
            <el-option label="RAND" value="RAND" />
            <el-option label="SEQ" value="SEQ" />
          </el-select>
        </el-form-item>
        <el-form-item label="Fallback Upstreams">
          <el-select :model-value="localModel.fallbackUpstreams" multiple @update:model-value="updateField('fallbackUpstreams', $event)">
            <el-option v-for="option in providerOptions" :key="option" :label="option" :value="option" />
          </el-select>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" :loading="saving" @click="$emit('submit', localModel)">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import UpstreamListField from '@/components/ai/route/UpstreamListField.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  modelValue: { type: Object, required: true },
  consumerOptions: { type: Array, default: () => [] },
  providerOptions: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})

defineEmits(['close', 'submit'])

const localModel = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (value) => {
    localModel.value = { ...value }
  },
  { deep: true, immediate: true }
)

function updateField(field, value) {
  localModel.value = { ...localModel.value, [field]: value }
}
</script>
```

```vue
// frontend-vue/src/views/ai/route/index.vue
<template>
  <div class="ai-console-page">
    <PageToolbar title="AI 路由管理" description="管理域名、Upstream、鉴权与 Fallback 策略">
      <template #filters>
        <el-input v-model="query" placeholder="搜索路由" clearable @change="loadRoutes" />
      </template>
      <template #actions>
        <el-button type="primary" @click="openCreate">新增路由</el-button>
      </template>
    </PageToolbar>

    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="name" label="路由名称" min-width="180" />
      <el-table-column label="域名" min-width="200">
        <template #default="scope">{{ scope.row.domains.join(', ') }}</template>
      </el-table-column>
      <el-table-column label="上游" min-width="220">
        <template #default="scope">{{ scope.row.upstreamSummary }}</template>
      </el-table-column>
      <el-table-column label="鉴权" width="120">
        <template #default="scope">
          <StatusTag :label="scope.row.authLabel" :tone="scope.row.authTone" />
        </template>
      </el-table-column>
      <el-table-column label="Fallback" width="120">
        <template #default="scope">
          <StatusTag :label="scope.row.fallbackLabel" :tone="scope.row.fallbackTone" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button text @click="openEdit(scope.row.name)">编辑</el-button>
          <el-button text type="danger" @click="openDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <RouteDrawer
      :visible="drawerVisible"
      :mode="drawerMode"
      :model-value="formModel"
      :consumer-options="consumerOptions"
      :provider-options="providerOptions"
      :saving="saving"
      @close="drawerVisible = false"
      @submit="submitRoute"
    />

    <DeleteConfirmDialog
      :visible="deleteVisible"
      title="删除 AI 路由"
      :message="deleteMessage"
      @cancel="deleteVisible = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createAiRoute,
  deleteAiRoute,
  getAiRoute,
  listAiRoutes,
  listConsumers,
  listProviders,
  updateAiRoute,
} from '@/api/aiApi'
import PageToolbar from '@/components/ai/PageToolbar.vue'
import DeleteConfirmDialog from '@/components/ai/DeleteConfirmDialog.vue'
import StatusTag from '@/components/ai/StatusTag.vue'
import RouteDrawer from './RouteDrawer.vue'
import { createRouteForm, routeFromApi, toRoutePayload, validateRouteForm } from './routeModel'

const loading = ref(false)
const saving = ref(false)
const query = ref('')
const rows = ref([])
const drawerVisible = ref(false)
const drawerMode = ref('create')
const formModel = ref(createRouteForm())
const consumerOptions = ref([])
const providerOptions = ref([])
const deleteVisible = ref(false)
const deletingName = ref('')

const deleteMessage = computed(() => `删除 ${deletingName.value} 后将无法恢复。`)

function decorateRoute(route) {
  return {
    ...route,
    upstreamSummary: (route.upstreams || []).map((item) => `${item.provider} (${item.weight})`).join(', '),
    authLabel: route.authConfig?.enabled ? '已启用' : '未启用',
    authTone: route.authConfig?.enabled ? 'success' : 'default',
    fallbackLabel: route.fallbackConfig?.enabled ? '已启用' : '未启用',
    fallbackTone: route.fallbackConfig?.enabled ? 'warning' : 'default',
  }
}

async function loadRoutes() {
  loading.value = true
  try {
    const [routeResponse, consumerResponse, providerResponse] = await Promise.all([
      listAiRoutes(),
      listConsumers(),
      listProviders(),
    ])
    rows.value = (routeResponse?.data || []).filter((item) => !query.value || item.name.includes(query.value)).map(decorateRoute)
    consumerOptions.value = (consumerResponse?.data || []).map((item) => item.name)
    providerOptions.value = (providerResponse?.data || []).map((item) => item.name)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  drawerMode.value = 'create'
  formModel.value = createRouteForm()
  drawerVisible.value = true
}

async function openEdit(name) {
  const response = await getAiRoute(name)
  formModel.value = routeFromApi(response.data)
  drawerMode.value = 'edit'
  drawerVisible.value = true
}

function openDelete(row) {
  deletingName.value = row.name
  deleteVisible.value = true
}

async function submitRoute(model) {
  const errors = validateRouteForm(model)
  if (errors.length) {
    ElMessage.error(errors[0])
    return
  }

  saving.value = true
  try {
    const payload = toRoutePayload(model)
    if (drawerMode.value === 'create') {
      await createAiRoute(payload)
    } else {
      await updateAiRoute(payload)
    }
    drawerVisible.value = false
    ElMessage.success('保存成功')
    await loadRoutes()
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  await deleteAiRoute(deletingName.value)
  deleteVisible.value = false
  ElMessage.success('删除成功')
  await loadRoutes()
}

onMounted(loadRoutes)
</script>
```

- [ ] **Step 4: Run the route tests to verify they pass**

Run: `npx vitest run tests/views/ai/route/routeModel.spec.js tests/views/ai/route/RouteDrawer.spec.js`

Expected: PASS with `3 passed`.

- [ ] **Step 5: Commit the route slice**

```bash
git add src/views/ai/route/index.vue src/views/ai/route/routeModel.js src/views/ai/route/RouteDrawer.vue src/components/ai/route/UpstreamListField.vue tests/views/ai/route/routeModel.spec.js tests/views/ai/route/RouteDrawer.spec.js
git commit -m "feat: implement ai route management page"
```

### Task 6: Implement The Consumer Page Slice

**Files:**
- Modify: `frontend-vue/src/views/ai/consumer/index.vue`
- Create: `frontend-vue/src/views/ai/consumer/consumerModel.js`
- Create: `frontend-vue/src/views/ai/consumer/ConsumerDrawer.vue`
- Create: `frontend-vue/src/components/ai/consumer/CredentialListField.vue`
- Create: `frontend-vue/tests/views/ai/consumer/consumerModel.spec.js`
- Create: `frontend-vue/tests/views/ai/consumer/ConsumerDrawer.spec.js`

- [ ] **Step 1: Write the failing consumer model and drawer tests**

```js
// frontend-vue/tests/views/ai/consumer/consumerModel.spec.js
import { describe, expect, it } from 'vitest'
import { createConsumerForm, toConsumerPayload } from '@/views/ai/consumer/consumerModel'

describe('consumerModel', () => {
  it('strips header and query names for bearer credentials', () => {
    const form = createConsumerForm()
    form.name = 'mobile-client'
    form.credentials = [
      {
        type: 'key-auth',
        key: 'secret',
        source: 'BEARER',
        headerName: 'x-api-key',
        queryName: 'api_key',
      },
    ]

    expect(toConsumerPayload(form)).toEqual({
      name: 'mobile-client',
      credentials: [
        {
          type: 'key-auth',
          key: 'secret',
          source: 'BEARER',
        },
      ],
    })
  })
})
```

```js
// frontend-vue/tests/views/ai/consumer/ConsumerDrawer.spec.js
import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import ConsumerDrawer from '@/views/ai/consumer/ConsumerDrawer.vue'
import { createConsumerForm } from '@/views/ai/consumer/consumerModel'

describe('ConsumerDrawer', () => {
  it('shows query-specific fields when the credential source is QUERY', () => {
    const form = createConsumerForm()
    form.credentials = [
      {
        type: 'key-auth',
        key: 'secret',
        source: 'QUERY',
        headerName: '',
        queryName: 'api_key',
      },
    ]

    const wrapper = mount(ConsumerDrawer, {
      props: {
        visible: true,
        mode: 'create',
        modelValue: form,
        saving: false,
      },
      global: {
        plugins: [ElementPlus],
      },
    })

    expect(wrapper.text()).toContain('Query 参数名')
  })
})
```

- [ ] **Step 2: Run the consumer tests to verify they fail**

Run: `npx vitest run tests/views/ai/consumer/consumerModel.spec.js tests/views/ai/consumer/ConsumerDrawer.spec.js`

Expected: FAIL because `consumerModel.js` and `ConsumerDrawer.vue` do not exist.

- [ ] **Step 3: Implement the consumer model, credential field, drawer, and page**

```js
// frontend-vue/src/views/ai/consumer/consumerModel.js
export function createConsumerForm() {
  return {
    name: '',
    version: '',
    credentials: [
      {
        type: 'key-auth',
        key: '',
        source: 'BEARER',
        headerName: '',
        queryName: '',
      },
    ],
  }
}

export function consumerFromApi(consumer) {
  return {
    name: consumer.name || '',
    version: consumer.version || '',
    credentials: (consumer.credentials || []).map((credential) => ({
      type: credential.type,
      key: credential.key || '',
      source: credential.source || 'BEARER',
      headerName: credential.headerName || '',
      queryName: credential.queryName || '',
    })),
  }
}

export function toConsumerPayload(form) {
  return {
    ...(form.version ? { version: form.version } : {}),
    name: form.name.trim(),
    credentials: form.credentials.map((credential) => {
      const payload = {
        type: credential.type,
        key: credential.key,
        source: credential.source,
      }

      if (credential.source === 'HEADER' && credential.headerName) {
        payload.headerName = credential.headerName
      }

      if (credential.source === 'QUERY' && credential.queryName) {
        payload.queryName = credential.queryName
      }

      return payload
    }),
  }
}
```

```vue
// frontend-vue/src/components/ai/consumer/CredentialListField.vue
<template>
  <div class="ai-array-field">
    <div v-for="(item, index) in modelValue" :key="index" class="ai-array-field__card">
      <el-select :model-value="item.source" @update:model-value="updateCredential(index, 'source', $event)">
        <el-option label="Bearer" value="BEARER" />
        <el-option label="Header" value="HEADER" />
        <el-option label="Query" value="QUERY" />
      </el-select>
      <el-input :model-value="item.key" placeholder="密钥" @update:model-value="updateCredential(index, 'key', $event)" />
      <el-input v-if="item.source === 'HEADER'" :model-value="item.headerName" placeholder="Header 名称" @update:model-value="updateCredential(index, 'headerName', $event)" />
      <el-input v-if="item.source === 'QUERY'" :model-value="item.queryName" placeholder="Query 参数名" @update:model-value="updateCredential(index, 'queryName', $event)" />
      <el-button text type="danger" @click="removeCredential(index)">删除</el-button>
    </div>
    <el-button @click="addCredential">新增凭证</el-button>
  </div>
</template>

<script setup>
const props = defineProps({ modelValue: { type: Array, required: true } })
const emit = defineEmits(['update:modelValue'])

function addCredential() {
  emit('update:modelValue', [
    ...props.modelValue,
    { type: 'key-auth', key: '', source: 'BEARER', headerName: '', queryName: '' },
  ])
}

function removeCredential(index) {
  emit('update:modelValue', props.modelValue.filter((_, current) => current !== index))
}

function updateCredential(index, field, value) {
  emit(
    'update:modelValue',
    props.modelValue.map((item, current) =>
      current === index
        ? {
            ...item,
            [field]: value,
            ...(field === 'source' && value === 'BEARER' ? { headerName: '', queryName: '' } : {}),
            ...(field === 'source' && value === 'HEADER' ? { queryName: '' } : {}),
            ...(field === 'source' && value === 'QUERY' ? { headerName: '' } : {}),
          }
        : item
    )
  )
}
</script>
```

```vue
// frontend-vue/src/views/ai/consumer/ConsumerDrawer.vue
<template>
  <el-drawer :model-value="visible" size="560px" @close="$emit('close')">
    <template #header>{{ mode === 'create' ? '创建消费者' : '编辑消费者' }}</template>
    <el-form label-position="top">
      <el-form-item label="消费者名称">
        <el-input :model-value="localModel.name" :disabled="mode === 'edit'" @update:model-value="updateField('name', $event)" />
      </el-form-item>
      <el-form-item label="认证凭证">
        <CredentialListField :model-value="localModel.credentials" @update:model-value="updateField('credentials', $event)" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" :loading="saving" @click="$emit('submit', localModel)">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import CredentialListField from '@/components/ai/consumer/CredentialListField.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
  modelValue: { type: Object, required: true },
  saving: { type: Boolean, default: false },
})

defineEmits(['close', 'submit'])

const localModel = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (value) => {
    localModel.value = { ...value }
  },
  { deep: true, immediate: true }
)

function updateField(field, value) {
  localModel.value = { ...localModel.value, [field]: value }
}
</script>
```

```vue
// frontend-vue/src/views/ai/consumer/index.vue
<template>
  <div class="ai-console-page">
    <PageToolbar title="消费者管理" description="管理 key-auth 消费者和凭证来源">
      <template #filters>
        <el-input v-model="query" placeholder="搜索消费者" clearable @change="loadConsumers" />
      </template>
      <template #actions>
        <el-button type="primary" @click="openCreate">新增消费者</el-button>
      </template>
    </PageToolbar>

    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="name" label="消费者名称" min-width="180" />
      <el-table-column label="凭证类型" width="140">
        <template #default="scope">{{ scope.row.credentialType }}</template>
      </el-table-column>
      <el-table-column label="来源类型" width="140">
        <template #default="scope">
          <StatusTag :label="scope.row.sourceLabel" :tone="scope.row.sourceTone" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button text @click="openEdit(scope.row.name)">编辑</el-button>
          <el-button text type="danger" @click="openDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <ConsumerDrawer
      :visible="drawerVisible"
      :mode="drawerMode"
      :model-value="formModel"
      :saving="saving"
      @close="drawerVisible = false"
      @submit="submitConsumer"
    />

    <DeleteConfirmDialog
      :visible="deleteVisible"
      title="删除消费者"
      :message="deleteMessage"
      @cancel="deleteVisible = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createConsumer, deleteConsumer, getConsumer, listConsumers, updateConsumer } from '@/api/aiApi'
import PageToolbar from '@/components/ai/PageToolbar.vue'
import DeleteConfirmDialog from '@/components/ai/DeleteConfirmDialog.vue'
import StatusTag from '@/components/ai/StatusTag.vue'
import ConsumerDrawer from './ConsumerDrawer.vue'
import { consumerFromApi, createConsumerForm, toConsumerPayload } from './consumerModel'

const loading = ref(false)
const saving = ref(false)
const query = ref('')
const rows = ref([])
const drawerVisible = ref(false)
const drawerMode = ref('create')
const formModel = ref(createConsumerForm())
const deleteVisible = ref(false)
const deletingName = ref('')

const deleteMessage = computed(() => `删除 ${deletingName.value} 后将无法恢复。`)

function decorateConsumer(consumer) {
  const firstCredential = consumer.credentials?.[0] || {}
  return {
    ...consumer,
    credentialType: firstCredential.type || 'key-auth',
    sourceLabel: firstCredential.source || 'BEARER',
    sourceTone: firstCredential.source === 'QUERY' ? 'warning' : firstCredential.source === 'HEADER' ? 'success' : 'default',
  }
}

async function loadConsumers() {
  loading.value = true
  try {
    const response = await listConsumers()
    rows.value = (response?.data || []).filter((item) => !query.value || item.name.includes(query.value)).map(decorateConsumer)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  drawerMode.value = 'create'
  formModel.value = createConsumerForm()
  drawerVisible.value = true
}

async function openEdit(name) {
  const response = await getConsumer(name)
  formModel.value = consumerFromApi(response.data)
  drawerMode.value = 'edit'
  drawerVisible.value = true
}

function openDelete(row) {
  deletingName.value = row.name
  deleteVisible.value = true
}

async function submitConsumer(model) {
  saving.value = true
  try {
    const payload = toConsumerPayload(model)
    if (drawerMode.value === 'create') {
      await createConsumer(payload)
    } else {
      await updateConsumer(payload)
    }
    drawerVisible.value = false
    ElMessage.success('保存成功')
    await loadConsumers()
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  await deleteConsumer(deletingName.value)
  deleteVisible.value = false
  ElMessage.success('删除成功')
  await loadConsumers()
}

onMounted(loadConsumers)
</script>
```

- [ ] **Step 4: Run the consumer tests to verify they pass**

Run: `npx vitest run tests/views/ai/consumer/consumerModel.spec.js tests/views/ai/consumer/ConsumerDrawer.spec.js`

Expected: PASS with `2 passed`.

- [ ] **Step 5: Commit the consumer slice**

```bash
git add src/views/ai/consumer/index.vue src/views/ai/consumer/consumerModel.js src/views/ai/consumer/ConsumerDrawer.vue src/components/ai/consumer/CredentialListField.vue tests/views/ai/consumer/consumerModel.spec.js tests/views/ai/consumer/ConsumerDrawer.spec.js
git commit -m "feat: implement consumer management page"
```

### Task 7: Run Full Verification And Fix Final Integration Gaps

**Files:**
- Modify: `frontend-vue/src/views/ai/provider/index.vue`
- Modify: `frontend-vue/src/views/ai/route/index.vue`
- Modify: `frontend-vue/src/views/ai/consumer/index.vue`
- Modify: `frontend-vue/src/layout/components/sidebar/index.vue`

- [ ] **Step 1: Run the focused AI test suite**

Run: `npx vitest run tests/router/aiRoutes.spec.js tests/layout/aiNavigation.spec.js tests/api/aiApi.spec.js tests/views/ai/provider/providerModel.spec.js tests/views/ai/provider/ProviderDrawer.spec.js tests/views/ai/route/routeModel.spec.js tests/views/ai/route/RouteDrawer.spec.js tests/views/ai/consumer/consumerModel.spec.js tests/views/ai/consumer/ConsumerDrawer.spec.js`

Expected: PASS with all AI-focused tests green.

- [ ] **Step 2: Fix any failing integration edges exposed by the focused test run**

```vue
// If a page still leaks old layout spacing, normalize the root wrapper.
<template>
  <div class="ai-console-page ai-console-page--table">
    <!-- existing page content -->
  </div>
</template>
```

```vue
// If the AI sidebar still highlights incorrectly, normalize active-path matching.
<router-link
  v-for="item in aiMenuItems"
  :key="item.path"
  :to="item.path"
  :class="['ai-sidebar-link', { 'is-active': activeMenu.startsWith(item.path) }]"
>
  {{ item.title }}
</router-link>
```

- [ ] **Step 3: Run lint for the touched slice**

Run: `npm run lint -- src/api/aiApi.js src/layout/layoutIndex.vue src/layout/components/sidebar/index.vue src/components/ai src/views/ai`

Expected: exit code `0` and no eslint errors.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: exit code `0` and a successful Vite build output.

- [ ] **Step 5: Commit the verified integration**

```bash
git add src/layout/components/sidebar/index.vue src/views/ai/provider/index.vue src/views/ai/route/index.vue src/views/ai/consumer/index.vue
git commit -m "chore: verify ai management pages integration"
```

---

## Self-Review Checklist

### Spec coverage

- Layout variant and AI sidebar: Task 2
- Shared AI primitives and delete dialog: Task 3
- Real CRUD API wiring: Task 3 plus Tasks 4-6
- Provider page, drawer, and Qwen failover state: Task 4
- Route page, drawer, multi-upstream state, fallback state, auth empty-state validation: Task 5
- Consumer page, drawer, `BEARER / HEADER / QUERY` states: Task 6
- Validation, build verification, and regression checks: Task 7

### Placeholder scan

- No unfinished placeholder markers remain.
- Every code-changing step contains explicit code blocks.
- Every executable step includes an exact command and expected result.

### Type and naming consistency

- Provider helpers: `createProviderForm`, `providerFromApi`, `toProviderPayload`, `getTokenModeLabel`
- Route helpers: `createRouteForm`, `routeFromApi`, `validateRouteForm`, `toRoutePayload`
- Consumer helpers: `createConsumerForm`, `consumerFromApi`, `toConsumerPayload`
- API functions: `listProviders`, `getProvider`, `createProvider`, `updateProvider`, `deleteProvider`, `listAiRoutes`, `getAiRoute`, `createAiRoute`, `updateAiRoute`, `deleteAiRoute`, `listConsumers`, `getConsumer`, `createConsumer`, `updateConsumer`, `deleteConsumer`
