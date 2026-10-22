import {LiveChatRequestError, requestJson} from './liveChatRequest'

describe('requestJson', () => {
  afterEach(() => jest.restoreAllMocks())

  it('returns JSON for successful responses', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({success: true}), {
        status: 200,
        headers: {'content-type': 'application/json'},
      })
    )

    await expect(requestJson('/rooms')).resolves.toEqual({success: true})
  })

  it('raises a typed error for failed responses', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({message: 'Unauthorized'}), {
        status: 401,
        headers: {'content-type': 'application/json'},
      })
    )

    await expect(requestJson('/rooms')).rejects.toMatchObject<Partial<LiveChatRequestError>>({
      status: 401,
      message: 'Unauthorized',
    })
  })
})
