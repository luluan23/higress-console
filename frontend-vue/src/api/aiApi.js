import request from '../utils/request'

const BASE = ''

function makeUrl(path) {
  return BASE + path
}

// ─── User ────────────────────────────────────────────────────────────────────
export function getUserInfo() {
  return request({ url: makeUrl('/user/info'), method: 'get' })
}

// ─── Providers ───────────────────────────────────────────────────────────────
export function getProviders() {
  return request({ url: makeUrl('/v1/ai/providers'), method: 'get' })
}

export function createProvider(data) {
  return request({ url: makeUrl('/v1/ai/providers'), method: 'post', data })
}

export function updateProvider(name, data) {
  return request({ url: makeUrl(`/v1/ai/providers/${encodeURIComponent(name)}`), method: 'put', data })
}

export function deleteProvider(name) {
  return request({ url: makeUrl(`/v1/ai/providers/${encodeURIComponent(name)}`), method: 'delete' })
}

// ─── Routes ──────────────────────────────────────────────────────────────────
export function getRoutes() {
  return request({ url: makeUrl('/v1/ai/routes'), method: 'get' })
}

export function createRoute(data) {
  return request({ url: makeUrl('/v1/ai/routes'), method: 'post', data })
}

export function updateRoute(name, data) {
  return request({ url: makeUrl(`/v1/ai/routes/${encodeURIComponent(name)}`), method: 'put', data })
}

export function deleteRoute(name) {
  return request({ url: makeUrl(`/v1/ai/routes/${encodeURIComponent(name)}`), method: 'delete' })
}

// ─── Consumers ───────────────────────────────────────────────────────────────
export function getConsumers() {
  return request({ url: makeUrl('/v1/consumers'), method: 'get' })
}

export function createConsumer(data) {
  return request({ url: makeUrl('/v1/consumers'), method: 'post', data })
}

export function updateConsumer(name, data) {
  return request({ url: makeUrl(`/v1/consumers/${encodeURIComponent(name)}`), method: 'put', data })
}

export function deleteConsumer(name) {
  return request({ url: makeUrl(`/v1/consumers/${encodeURIComponent(name)}`), method: 'delete' })
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export function getDashboardInfo(type = 'AI') {
  return request({ url: makeUrl(`/dashboard/info?type=${encodeURIComponent(type)}`), method: 'get' })
}

export function initDashboard() {
  return request({ url: makeUrl('/dashboard/init'), method: 'post' })
}
