import { describe, expect, it } from 'vitest'
import { buildRegistrationPayload, flattenRecord, isValidNewPassword } from './aureon'

describe('AUREON record helpers', () => {
  it('flattens AUREON project records into app rows', () => {
    expect(flattenRecord({ id: 'abc', data: { title: 'Cuidar de mim', completed: false }, created_at: '2026-09-12T12:00:00Z' })).toEqual({
      id: 'abc',
      title: 'Cuidar de mim',
      completed: false,
      created_at: '2026-09-12T12:00:00Z',
    })
  })

  it('builds a normalized Conexão Ela registration payload', () => {
    expect(buildRegistrationPayload(' Nova@example.test ', '1234567890')).toEqual({
      email: 'nova@example.test',
      password: '1234567890',
      project_slug: 'barbara-life',
    })
  })

  it('requires at least ten characters for a new password', () => {
    expect(isValidNewPassword('123456789')).toBe(false)
    expect(isValidNewPassword('1234567890')).toBe(true)
  })
})
