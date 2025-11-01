import { Route } from 'react-router-dom'

import { Router } from 'lib/electron-router-dom'

import { MainScreen } from './screens/main'

export const AppRoutes = () => {
  return <Router main={<Route element={<MainScreen />} path="/" />} />
}
