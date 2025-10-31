import { useEffect } from 'react'

// The "App" comes from the context bridge in preload/index.ts
const { App } = window

export function MainScreen() {
  useEffect(() => {
    // check the console on dev tools
    App.sayHelloFromBridge()
  }, [])


  return (
    <main className="flex flex-col items-center justify-center h-screen bg-black">

    </main>
  )
}
