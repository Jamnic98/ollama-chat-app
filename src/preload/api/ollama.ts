import { chatEndpoint } from 'shared/constants'

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  id: string
  message: Message
  // add more fields if needed
}

export const OllamaAPI = {
  chat: async (
    model: string,
    messages: Message[],
    stream: boolean = false,
    onData?: (chunk: string) => void // callback for streaming text
  ): Promise<ChatResponse | void> => {
    if (!stream) {
      const res = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream }),
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      return res.json() as Promise<ChatResponse>
    }

    // Streaming mode
    const res = await fetch(chatEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true }),
    })

    if (!res.body) throw new Error('No response body for streaming')

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let finished = false
    while (!finished) {
      const { value, done } = await reader.read()
      finished = done
      if (value) {
        const chunkStr = decoder.decode(value)
        try {
          const parsed = JSON.parse(chunkStr)
          const content = parsed?.message?.content
          if (content) {
            onData?.(content)
          }
        } catch {
          // fallback if not JSON, just append raw text
          onData?.(chunkStr)
        }
      }
    }
  },
}
