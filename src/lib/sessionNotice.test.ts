import { beforeEach, describe, expect, it } from 'vitest'
import { saveSessionNotice, takeSessionNotice } from './sessionNotice'

describe('session notice', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => { values.set(key, value) },
        removeItem: (key: string) => { values.delete(key) },
      },
    })
  })

  it('stores and consumes a notice once', () => {
    saveSessionNotice('Complete seu perfil.')
    expect(takeSessionNotice()).toBe('Complete seu perfil.')
    expect(takeSessionNotice()).toBeNull()
  })

  it('ignores empty notices', () => {
    saveSessionNotice('   ')
    expect(takeSessionNotice()).toBeNull()
  })
})
