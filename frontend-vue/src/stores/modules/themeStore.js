import { defineStore } from 'pinia'

export const useThemeStore = defineStore('themeStore', {
  state: () => ({
    theme: 'system', // 'dark' | 'light' | 'system'
  }),
  getters: {
    resolvedTheme(state) {
      if (state.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return state.theme
    },
  },
  actions: {
    initTheme() {
      const stored = localStorage.getItem('theme')
      if (stored && ['dark', 'light', 'system'].includes(stored)) {
        this.theme = stored
      }
      this._applyTheme()
      // Watch system preference changes when theme is 'system'
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.theme === 'system') {
          this._applyTheme()
        }
      })
    },
    toggleTheme() {
      this.theme = this.resolvedTheme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', this.theme)
      this._applyTheme()
    },
    setTheme(value) {
      this.theme = value
      localStorage.setItem('theme', value)
      this._applyTheme()
    },
    _applyTheme() {
      document.documentElement.setAttribute('data-theme', this.resolvedTheme)
    },
  },
})
