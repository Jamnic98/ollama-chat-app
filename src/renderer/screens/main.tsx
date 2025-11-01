import {useState} from 'react'

import {ChatBox, ModelSelector} from "renderer/components"

export const MainScreen = () => {
  const [currentModel, setCurrentModel] = useState('');

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-white">
      <ModelSelector selectedModel={currentModel} onSelect={(model) => setCurrentModel(model)} />
      <ChatBox />
    </main>
  )
}
