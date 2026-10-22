import {mergeLiveChatMessages} from './liveChatMessages'

describe('mergeLiveChatMessages', () => {
  it('keeps chronological order and deduplicates events received during history loading', () => {
    const history = [
      {id: 2, createdAt: '2026-10-21T10:00:00.000Z'},
      {id: 4, createdAt: '2026-10-21T10:02:00.000Z'},
    ]
    const realtime = [
      {id: 3, createdAt: '2026-10-21T10:01:00.000Z'},
      {id: 4, createdAt: '2026-10-21T10:02:00.000Z'},
    ]

    expect(mergeLiveChatMessages(history, realtime).map((message) => message.id)).toEqual([2, 3, 4])
  })

  it('uses message id as a stable tie-breaker for equal timestamps', () => {
    const timestamp = '2026-10-21T10:00:00.000Z'

    expect(
      mergeLiveChatMessages([{id: 9, createdAt: timestamp}], [{id: 7, createdAt: timestamp}]).map(
        (message) => message.id
      )
    ).toEqual([7, 9])
  })
})
