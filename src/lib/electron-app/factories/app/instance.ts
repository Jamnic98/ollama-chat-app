import { app } from 'electron'

export const makeAppWithSingleInstanceLock = (fn: () => void) => {
  const isPrimaryInstance = app.requestSingleInstanceLock()

  !isPrimaryInstance ? app.quit() : fn()
}
