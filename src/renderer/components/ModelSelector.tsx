'use client'

import { useEffect, useState, useRef } from 'react'

import { type OllamaModel } from 'preload/api/ollama'
// import { BsCaretDownFill } from 'react-icons/bs'
// import { IoClose } from 'react-icons/io5'

const {App} = window

interface ModelSelectorProps {
  defaultValue?: string
  selectedModel: string
  onSelect: (model: string) => void
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  defaultValue = 'Select Model',
  selectedModel,
  onSelect
}) => {
  const [models, setModels] = useState<OllamaModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hideDropdown, setHideDropdown] = useState(true)
  const selectRef = useRef<HTMLDivElement>(null)

  // Fetch models
  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true)
      setError(null)
      try {
        const { models } = await App.listModels()
        setModels(models)
      } catch (err) {
        console.error('Failed to fetch models:', err)
        setError('Failed to load models')
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  // Handle dropdown toggle and outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setHideDropdown(true)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectClick = () => {
    if (!loading && !error) setHideDropdown((prev) => !prev)
  }

  const handleOptionClick = (name: string) => {
    setHideDropdown(true)
    onSelect(name)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect('')
  }

  return (
    <div className="relative w-full" ref={selectRef}>
      {/* Select bar */}
      <div
        className={`${
          hideDropdown ? 'rounded shadow' : 'rounded-t-sm'
        } flex  items-center justify-between bg-neutral-50 px-4 py-2`}
        onClick={handleSelectClick}
      >
        <span className="text-base font-medium text-gray-950">
          {loading ? 'Loading models...' : error ? error : selectedModel || defaultValue}
        </span>

        <div className="flex items-center space-x-2">
          {/* Clear button */}
          {selectedModel && selectedModel !== defaultValue && !loading && !error && (
            <button
              onClick={handleClear}
              className="rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900 "
              aria-label="Clear selection"
            >
              {/* <IoClose className="h-4 w-4" /> */}
              x
            </button>
          )}
          {/* Dropdown icon */}
          {/* <BsCaretDownFill
            className={`text-gray-950 transition-transform ${hideDropdown ? '' : 'rotate-180'}`}
          /> */}
        </div>
      </div>

      {/* Dropdown */}
      {!hideDropdown && !loading && !error && (
        <div className="absolute z-10 w-full rounded-b bg-neutral-50 shadow">
          {models.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">No models found</div>
          ) : (
            models
              // .filter((m) => m.name !== selectedModel)
              .map(({ name }, i) => (
                <div
                  key={i}
                  onClick={() => handleOptionClick(name)}
                  className=" px-4 py-2 hover:bg-blue-600 hover:text-white"
                >
                  {name}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  )
}

export default ModelSelector
