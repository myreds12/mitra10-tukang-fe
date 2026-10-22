export class LiveChatRequestError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'LiveChatRequestError'
  }
}

export const requestJson = async (input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, init)
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message =
      typeof body === 'object' && body?.message
        ? body.message
        : `Request gagal (HTTP ${response.status})`
    throw new LiveChatRequestError(response.status, message)
  }

  return body
}
