import {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import {LibraryBig} from 'lucide-react'

import {ChatBox, ModelSelector} from "renderer/components"

const MainScreen = () => {
  const navigate = useNavigate()
  const [currentModel, setCurrentModel] = useState('');
  
  return (
    <main className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="flex flex-col w-1/5 h-full bg-white shadow-lg border-r border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Models</h2>
          <button
            className="border-none ml-2 px-2 py-1 hover:scale-120 text-gray-700 rounded transition-colors "
            aria-label="Close"
          >
            <LibraryBig onClick={() => navigate('models')} />
          </button>
        </div>

        <ModelSelector
          selectedModel={currentModel}
          onSelect={(model) => setCurrentModel(model)}
        />

        {/* Divider */}
        {/* <hr className="my-12" /> */}

        {/* Chat History */}
        {/* <h3 className="tex font-semibold mb-4 text-gray-700">Chats</h3>
        <div className="flex flex-col space-y-2 overflow-y-auto">
          {['Chat 1', 'Chat 2', 'Chat 3'].map((chat, i) => (
            <button
              key={i}
              className="px-3 py-2 text-left rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 shadow-sm"
            >
              {chat}
            </button>
          ))}
        </div> */}

        {/* Footer (optional) */}
        <div className="mt-auto pt-4 text-xs text-gray-400">
          <p>Ollama Chat • Local AI</p>
        </div>
      </aside>

      {/* Chat Section */}
      <section className="flex-1 flex items-center justify-center p-6">
        <ChatBox key={currentModel} selectedModel={currentModel} />
      </section>
    </main>
  )
}

export default MainScreen
