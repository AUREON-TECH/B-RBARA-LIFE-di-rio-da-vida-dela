const NOTICE_KEY = 'conexao_ela_notice_v1'

export function saveSessionNotice(message: string) {
  const value = message.trim()
  if (!value) return
  try { sessionStorage.setItem(NOTICE_KEY, value) } catch {}
}

export function takeSessionNotice() {
  try {
    const value = sessionStorage.getItem(NOTICE_KEY)
    if (value !== null) sessionStorage.removeItem(NOTICE_KEY)
    return value
  } catch {
    return null
  }
}
