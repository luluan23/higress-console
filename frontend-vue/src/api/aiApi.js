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