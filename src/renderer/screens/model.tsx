import { useEffect, useState } from 'react'
import { OllamaModel } from '~/src/preload/api/ollama'

const { App } = window

const ModelScreen = () => {
  const [modelNameInput, setModelNameInput] = useState('')
  const [models, setModels] = useState<OllamaModel[]>([])
  const [pullingModel, setPullingModel] = useState(false)
  const [layers, setLayers] = useState<{ digest: string; completed: number; total: number }[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [alert, setAlert] = useState<{ type: 'error' | 'info'; message: string } | null>(null)

  const fetchModels = async () => {
    try {
      const res = await App.listModels()
      setModels(res.models)
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message })
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  // Update layer progress
  const updateLayer = (digest: string, completed: number, total: number) => {
    setLayers(prev => {
      const exists = prev.find(l => l.digest === digest)
      if (exists) {
        return prev.map(l => l.digest === digest ? { ...l, completed, total } : l)
      }
      return [...prev, { digest, completed, total }]
    })
  }

  // Recompute overall progress
  useEffect(() => {
    const totalBytes = layers.reduce((sum, l) => sum + l.total, 0)
    const completedBytes = layers.reduce((sum, l) => sum + l.completed, 0)
    setOverallProgress(totalBytes ? Math.floor((completedBytes / totalBytes) * 100) : 0)
  }, [layers])

  const handlePullModel = async () => {
    if (!modelNameInput) return;
    setPullingModel(true);
    setLayers([]);
    setOverallProgress(0);
    setAlert(null);

    try {
      await App.pullModel(modelNameInput, (percent, layersArray) => {
        setLayers(layersArray || []);
        setOverallProgress(percent);
      });
      await fetchModels();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setPullingModel(false);
      setModelNameInput('');
    }
  }

  const handleDeleteModel = async (name: string) => {
    try {
      await App.deleteModel(name)
      await fetchModels()
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message })
    }
  }

  return (
    <div className="p-6 flex flex-col w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Models</h1>

      {alert && (
        <div className={`mb-4 p-2 rounded ${alert.type === 'error' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>
          {alert.message}
        </div>
      )}

      {/* Pull Model */}
      <div className="mb-6 flex gap-2">
        <input
          className="border border-gray-300 rounded p-2 flex-1"
          placeholder="Model name..."
          value={modelNameInput}
          onChange={(e) => setModelNameInput(e.target.value)}
          disabled={pullingModel}
        />
        <button
          className={`px-4 py-2 rounded ${pullingModel ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
          onClick={handlePullModel}
          disabled={pullingModel}
        >
          {pullingModel ? 'Pulling...' : 'Pull'}
        </button>
      </div>

      {/* Overall Progress */}
      {pullingModel && (
        <div className="mb-4">
          <p className="text-sm mb-1">Overall Progress: {overallProgress}%</p>
          <div className="w-full bg-gray-200 h-3 rounded">
            <div className="bg-blue-500 h-3 rounded" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      )}

      {/* Layer Progress */}
      {pullingModel && layers.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Layer Progress</h2>
          {layers.map(layer => (
            <div key={layer.digest} className="mb-2">
              <p className="text-sm truncate">{layer.digest}</p>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${Math.floor((layer.completed / layer.total) * 100)}%` }}
                />
              </div>
              <p className="text-xs">{layer.completed} / {layer.total} bytes</p>
            </div>
          ))}
        </div>
      )}

      {/* Model List */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Available Models</h2>
        <div className="flex flex-col gap-2">
          {models.map(model => (
            <div key={model.name} className="flex justify-between items-center p-2 border rounded bg-gray-50">
              <div>
                <p className="font-medium">{model.name}</p>
                <p className="text-xs text-gray-500">{model.details.parameter_size} params • {model.details.quantization_level}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-red-400 text-white rounded text-sm"
                  onClick={() => handleDeleteModel(model.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModelScreen
