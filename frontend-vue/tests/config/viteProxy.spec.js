import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('vite dev proxy', () => {
  it('proxies AI statistics backend routes to the local console backend', () => {
    const viteConfigSource = readFileSync(resolve(__dirname, '../../vite.config.js'), 'utf8')

    expect(viteConfigSource).toContain("'/dashboard':")
    expect(viteConfigSource).toContain("target: \"http://localhost:18001/\"")
    expect(viteConfigSource).toContain("'/grafana':")
  })
})