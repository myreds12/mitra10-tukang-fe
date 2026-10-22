export interface LiveChatMessageLike {
  id: number
  createdAt: string
}

export const mergeLiveChatMessages = <T extends LiveChatMessageLike>(
  existing: T[],
  incoming: T[]
): T[] => {
  const byId = new Map<number, T>(existing.map((message) => [message.id, message]))

  incoming.forEach((message) => byId.set(message.id, message))

  return [...byId.values()].sort((left, right) => {
    const timestampOrder = left.createdAt.localeCompare(right.createdAt)
    return timestampOrder || left.id - right.id
  })
}
