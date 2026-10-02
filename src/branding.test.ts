import indexHtml from '../index.html?raw'
import manifestRaw from '../public/manifest.webmanifest?raw'
import { describe, expect, it } from 'vitest'

const manifest = JSON.parse(manifestRaw) as {
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
