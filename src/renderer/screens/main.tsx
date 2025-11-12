import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LibraryBig, /* Star */ } from 'lucide-react'

import { ChatBox, ModelSelector } from 'renderer/components'
import { OllamaModel } from 'preload/api/ollama'
import { getFavourites } from 'shared/utils'

const { App } = window

const MainScreen = () => {
  const navigate = useNavigate()
  const [currentModel, setCurrentModel] = useState('')
  const [models, setModels] = useState<OllamaModel[]>([])
  const [favourites, setFavourites] = useState<string[]>(getFavourites())

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const { models } = await App.listModels()
        setModels(models)
      } catch (err) {
        console.error(err)
      }
    }
    fetchModels()

    // Listen for localStorage changes (if ModelScreen changes favourites)
    const handleStorage = () => setFavourites(getFavourites())
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <main className="flex h-screen bg-gray-100 text-gray-900">
      <aside className="flex flex-col min-w-64 max-w-96 w-1/5 h-full bg-white shadow-lg border-r border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Models</h2>
          <button
            className="border-none ml-2 px-2 py-1 hover:scale-120 text-gray-700 rounded transition-colors"
            onClick={() => navigate('models')}
          >
            <LibraryBig />
          </button>
        </div>

        <ModelSelector
          selectedModel={currentModel}
          onSelect={(model) => setCurrentModel(model)}
        />

        <hr className="my-4" />

        {/* Favourites Section */}
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-2">
          <span>Favourites</span>
          {/* <Star className="w-4 h-4 text-yellow-500" /> */}
        </h2>

        <div className="flex flex-col space-y-1 mb-6">
          {favourites.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No favourites yet</p>
          ) : (
            favourites.map((fav, i) => (
              <button
                key={i}
                onClick={() => setCurrentModel(fav)}
                className={`px-2 py-1 text-sm text-left rounded-md transition-colors ${
                  currentModel === fav
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {fav}
              </button>
            ))
          )}
        </div>

        <div className="mt-auto pt-4 text-xs text-gray-400">
          <p>Ollama Chat • Local AI</p>
        </div>
      </aside>

      <section className="flex-1 flex items-center justify-center p-6">
        <ChatBox key={currentModel} selectedModel={currentModel} />
      </section>
    </main>
  )
}

export default MainScreen
