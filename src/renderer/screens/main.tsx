import {ChatBox} from "renderer/components"

export function MainScreen() {
  // useEffect(() => {
  //   // check the console on dev tools
  //   App.sayHelloFromBridge()
  // }, [])


  return (
    <main className="flex flex-col items-center justify-center h-screen bg-white">
      <ChatBox />
    </main>
  )
}
