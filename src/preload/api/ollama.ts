import { chatEndpoint, deleteModelEndpoint, listModelsEndpoint, pullModelEndpoint } from 'shared/constants'

export type Message = {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  id: string
  message: Message
}

export interface OllamaModel {
  "name": string,
  "modified_at": string,
  "size": number,
  "digest": string,
  "details": {
    "format": string,
    "family": string,
    "families": null,
    "parameter_size": string,
    "quantization_level": string
  }
}

export interface ListModelsResponse {
  models: OllamaModel[]
}

export const OllamaAPI = {
  chat: async (
    model: string,
    messages: Message[],
    stream: boolean = false,
    onData?: (chunk: string) => void
  ): Promise<ChatResponse | void> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000); // 60s timeout

    try {
      const body = JSON.stringify({ model, messages, stream });
      const res = await fetch(chatEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        // Try to extract error details if available
        let errMsg = `${res.status} ${res.statusText}`;
        try {
          const json = await res.json();
          if (json.error) errMsg = json.error;
        } catch {
          // ignore parse errors
        }
        throw new Error(`Chat request failed: ${errMsg}`);
      }

      // Non-stream mode
      if (!stream) {
        try {
          return await res.json();
        } catch (err) {
          throw new Error(`Invalid JSON response from server: ${(err as Error).message}`);
        }
      }

      // --- Streaming mode ---
      if (!res.body) throw new Error('No response body for streaming');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let buffer = '';
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        finished = done;

        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          buffer += chunkStr;

          // Some streams can split JSON objects across chunks, so handle partials safely
          const parts = buffer.split('\n');
          buffer = parts.pop() || ''; // Keep last incomplete piece

          for (const part of parts) {
            if (!part.trim()) continue;
            try {
              const parsed = JSON.parse(part);
              const content = parsed?.message?.content;
              if (content) onData?.(content);
            } catch {
              // If chunk isn’t valid JSON, just treat it as raw text
              onData?.(part);
            }
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          const content = parsed?.message?.content;
          if (content) onData?.(content);
        } catch {
          onData?.(buffer);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Chat request timed out after 60s');
      } else if (err.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to Ollama — is it running?');
      } else {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  },

  listModels: async (): Promise<ListModelsResponse> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(listModelsEndpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        let errMsg = `${res.status} ${res.statusText}`;
        try {
          const json = await res.json();
          if (json.error) errMsg = json.error;
        } catch {
          // ignore parse errors (non-JSON errors)
        }
        throw new Error(`Failed to fetch models: ${errMsg}`);
      }

      try {
        const data = await res.json();
        if (!data || !Array.isArray(data.models)) {
          throw new Error('Invalid API response format');
        }
        return data;
      } catch (err) {
        throw new Error(`Invalid response format: ${(err as Error).message}`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Model listing request timed out');
      } else if (err.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to Ollama — is it running?');
      } else {
        throw new Error(`Unexpected error while listing models: ${err.message}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  },

  pullModel: async (
    modelName: string,
    onProgress?: (progress: { digest: string, completed: number, total: number }) => void
  ): Promise<void> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60 * 60 * 1000)

    try {
      const res = await fetch(pullModelEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName }),
        signal: controller.signal,
      })

      if (!res.ok) {
        if (res.status === 400) throw new Error(`Model "${modelName}" does not exist`)
        let errMsg = `${res.status} ${res.statusText}`
        try {
          const json = await res.json()
          if (json.error) errMsg = json.error
        } catch {}
        throw new Error(`Failed to pull model: ${errMsg}`)
      }

      if (!res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const obj = JSON.parse(line)
            // Only process if completed/total exist
            if (obj.completed !== undefined && obj.total !== undefined && obj.digest && onProgress) {
              onProgress({ digest: obj.digest, completed: obj.completed, total: obj.total })
            }
          } catch {}
        }
      }

      // Final chunk
      if (buffer.trim()) {
        try {
          const obj = JSON.parse(buffer)
          if (obj.completed !== undefined && obj.total !== undefined && obj.digest && onProgress) {
            onProgress({ digest: obj.digest, completed: obj.completed, total: obj.total })
          }
        } catch {}
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw new Error('Pull request timed out')
      throw new Error(`Failed to pull model: ${err.message}`)
    } finally {
      clearTimeout(timeout)
    }
  },

  deleteModel: async (modelName: string): Promise<void> => {
    try {
      const res = await fetch(deleteModelEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
      })

      if (!res.ok) {
        let errMsg = `${res.status} ${res.statusText}`
        try {
          const json = await res.json()
          if (json.error) errMsg = json.error
        } catch {
          // ignore parse errors
        }
        throw new Error(`Failed to delete model: ${errMsg}`)
      }
    } catch (err: any) {
      throw new Error(`Delete request failed: ${err.message}`)
    }
  },
}
