import { beforeEach, describe, expect, it } from 'vitest'
import { DIARY_PIN_STORAGE_KEY, THEME_STORAGE_KEY, isDiaryPinValid, isProfileImageSizeAllowed, loadDiaryPinRecord, normalizeTheme, profileInitial, profilePhotoKey, restoreTheme } from './profile'

describe('Conexão Ela profile helpers', () => {
  it('accepts only supported profile themes', () => {
    expect(normalizeTheme('rose')).toBe('rose')
    expect(normalizeTheme('light')).toBe('light')
    expect(normalizeTheme('night')).toBe('night')
    expect(normalizeTheme('anything')).toBe('rose')
  })

  it('requires a 4 to 6 digit diary PIN', () => {
    expect(isDiaryPinValid('1234')).toBe(true)
    expect(isDiaryPinValid('123456')).toBe(true)
    expect(isDiaryPinValid('123')).toBe(false)
    expect(isDiaryPinValid('12a4')).toBe(false)
  })

  it('keeps profile images inside the AUREON Base private-storage limit', () => {
    expect(isProfileImageSizeAllowed(64 * 1024)).toBe(true)
    expect(isProfileImageSizeAllowed(128 * 1024)).toBe(true)
    expect(isProfileImageSizeAllowed(128 * 1024 + 1)).toBe(false)
  })

  it('builds a user-scoped private profile photo key', () => {
    expect(profilePhotoKey('user-123', 'jpeg')).toBe('profiles/user-123/avatar.jpeg')
  })

  beforeEach(() => {
    const values = new Map<string, string>()
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => { values.set(key, value) },
        removeItem: (key: string) => { values.delete(key) },
      },
    })
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { documentElement: { dataset: {} } },
    })
  })

  it('uses Conexão Ela local-storage keys', () => {
    expect(THEME_STORAGE_KEY).toBe('conexao_ela_theme_v1')
    expect(DIARY_PIN_STORAGE_KEY).toBe('conexao_ela_diary_pin_v1')
  })

  it('prefers the new theme key over the legacy value', () => {
    localStorage.setItem('barbara_life_theme_v1', 'night')
    localStorage.setItem('conexao_ela_theme_v1', 'light')
    expect(restoreTheme()).toBe('light')
  })

  it('migrates a legacy theme without deleting the old value', () => {
    localStorage.setItem('barbara_life_theme_v1', 'night')
    expect(restoreTheme()).toBe('night')
    expect(localStorage.getItem('conexao_ela_theme_v1')).toBe('night')
    expect(localStorage.getItem('barbara_life_theme_v1')).toBe('night')
  })

  it('migrates a legacy diary PIN record without deleting it', () => {
    const record = { version: 1, salt: 'c2FsdA==', hash: 'aGFzaA==' }
    localStorage.setItem('barbara_life_diary_pin_v1', JSON.stringify(record))
    expect(loadDiaryPinRecord()).toEqual(record)
    expect(localStorage.getItem('conexao_ela_diary_pin_v1')).toBe(JSON.stringify(record))
    expect(localStorage.getItem('barbara_life_diary_pin_v1')).toBe(JSON.stringify(record))
  })
})


describe('profile identity helper', () => {
  it("uses the current user's initial instead of a fixed Bárbara initial", () => {
    expect(profileInitial('Mariana')).toBe('M')
    expect(profileInitial('  ana')).toBe('A')
    expect(profileInitial('')).toBe('E')
  })
})
