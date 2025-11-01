import { app } from 'electron'
import { join } from 'node:path'

import { createWindow } from 'lib/electron-app/factories/windows/create'
import { ENVIRONMENT } from 'shared/constants'
import { displayName } from '~/package.json'
import { startOllama, stopOllama } from '~/src/main/ollamaManager'

export const MainWindow = async () => {
  // Start Ollama server
  startOllama()

  const window = createWindow({
    id: 'main',
    title: displayName,
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    show: false,
    center: true,
    movable: true,
    resizable: true,
    alwaysOnTop: false,
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  window.webContents.on('did-finish-load', () => {
    if (ENVIRONMENT.IS_DEV) {
      window.webContents.openDevTools({ mode: 'detach' })
    }

    window.show()
  })

  window.on('close', (e) => {
    e.preventDefault();
    console.log('[App] shutting down...');

    try {
      stopOllama();
    } catch (err) {
      console.error('Error stopping Ollama:', err);
    }

    setTimeout(() => {
      window.destroy();
      app.quit();
    }, 300);
  });

  return window
}
