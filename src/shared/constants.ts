export const ENVIRONMENT = {
  IS_DEV: process.env.NODE_ENV === 'development',
}

export const PLATFORM = {
  IS_MAC: process.platform === 'darwin',
  IS_WINDOWS: process.platform === 'win32',
  IS_LINUX: process.platform === 'linux',
}

// Endpoints
const localOllamaEndpoint = "http://localhost:11434/api"
export const chatEndpoint = `${localOllamaEndpoint}/chat`
export const generateEndpoint = `${localOllamaEndpoint}/generate`
export const pullModelEndpoint = `${localOllamaEndpoint}/pull`
export const listModelsEndpoint = `${localOllamaEndpoint}/tags`
export const versionEndpoint = `${localOllamaEndpoint}/version`
