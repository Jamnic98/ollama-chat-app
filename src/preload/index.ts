import { contextBridge } from 'electron'
import { OllamaAPI } from './api/ollama'

declare global {
  interface Window {
    App: typeof API
  }
}

const API = {
  sayHelloFromBridge: () => console.log('\nHello from bridgeAPI! 👋\n\n'),
  ...OllamaAPI
}

contextBridge.exposeInMainWorld('App', API)