import { defineStore } from 'pinia'
import {
  getProviders, createProvider, updateProvider, deleteProvider,
  getRoutes, createRoute, updateRoute, deleteRoute,
  getConsumers, createConsumer, updateConsumer, deleteConsumer,
} from '../../api/aiApi'

export const useAiStore = defineStore('aiStore', {
  state: () => ({
    providers: [],
    routes: [],
    consumers: [],
    loadingProviders: false,
    loadingRoutes: false,
    loadingConsumers: false,
  }),

  actions: {
    // ── Providers ──────────────────────────────────────────
    async fetchProviders() {
      this.loadingProviders = true
      try {
        const res = await getProviders()
        this.providers = res?.data?.list || res?.data || res?.list || []
      } finally {
        this.loadingProviders = false
      }
    },
    async createProvider(data) {
      await createProvider(data)
      await this.fetchProviders()
    },
    async updateProvider(name, data) {
      await updateProvider(name, data)
      await this.fetchProviders()
    },
    async deleteProvider(name) {
      await deleteProvider(name)
      await this.fetchProviders()
    },

    // ── Routes ─────────────────────────────────────────────
    async fetchRoutes() {
      this.loadingRoutes = true
      try {
        const res = await getRoutes()
        this.routes = res?.data?.list || res?.data || res?.list || []
      } finally {
        this.loadingRoutes = false
      }
    },
    async createRoute(data) {
      await createRoute(data)
      await this.fetchRoutes()
    },
    async updateRoute(name, data) {
      await updateRoute(name, data)
      await this.fetchRoutes()
    },
    async deleteRoute(name) {
      await deleteRoute(name)
      await this.fetchRoutes()
    },

    // ── Consumers ──────────────────────────────────────────
    async fetchConsumers() {
      this.loadingConsumers = true
      try {
        const res = await getConsumers()
        this.consumers = res?.data?.list || res?.data || res?.list || []
      } finally {
        this.loadingConsumers = false
      }
    },
    async createConsumer(data) {
      await createConsumer(data)
      await this.fetchConsumers()
    },
    async updateConsumer(name, data) {
      await updateConsumer(name, data)
      await this.fetchConsumers()
    },
    async deleteConsumer(name) {
      await deleteConsumer(name)
      await this.fetchConsumers()
    },
  },
})
