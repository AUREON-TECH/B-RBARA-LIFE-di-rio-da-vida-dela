import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const manifest = JSON.parse(readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8')) as {
  name: string
  short_name: string
  description: string
}

describe('Conexão Ela branding', () => {
  it('uses Conexão Ela in browser metadata', () => {
    expect(indexHtml).toContain('<title>Conexão Ela</title>')
    expect(indexHtml).toContain('Conexão Ela')
  })

  it('uses Conexão Ela in PWA metadata', () => {
    expect(manifest.name).toBe('Conexão Ela')
    expect(manifest.short_name).toBe('Conexão Ela')
    expect(manifest.description).toContain('mulheres')
  })

  it('removes the old product name from public metadata', () => {
    const metadata = `${indexHtml}\n${JSON.stringify(manifest)}`
    expect(metadata).not.toMatch(/Bárbara Life|Diário da Bárbara/i)
  })
})
