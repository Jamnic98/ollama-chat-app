import { useEffect, useState } from "react";
import { OllamaAPI, type OllamaModel } from "preload/api/ollama";

interface ModelSelectorProps  {
  selectedModel: string;
  onSelect: (model: string) => void;
};

const ModelSelector = ({ selectedModel, onSelect }: ModelSelectorProps) => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const {models} = await OllamaAPI.listModels();
        setModels(models);
      } catch (err) {
        console.error("Failed to fetch models", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <label className="font-semibold text-gray-700">Model:</label>
      <select
        value={selectedModel}
        onChange={(e) => onSelect(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {loading ? (
          <option>Loading...</option>
        ) : (
          models.map(({name}, i) => (
            <option key={i} value={name}>
              {name}
            </option>
          ))
        )}
      </select>
    </div>
  );
};

export default ModelSelector