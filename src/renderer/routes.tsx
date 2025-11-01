import { Route } from 'react-router-dom'

import { Router } from 'lib/electron-router-dom'

import { MainScreen, ModelScreen } from './screens'

export const AppRoutes = () => {
    return <Router main={
      <>
        <Route element={<MainScreen />} path="/" />
        <Route element={<ModelScreen />} path="models" />
      </>
    } 
  />
}
