'use client'

import { useState } from 'react'
import { AIModel } from '@/types/ai'
import { ChevronDownIcon, BotIcon, ZapIcon, BrainIcon, CodeIcon } from 'lucide-react'

interface AgentSelectorProps {
  models: AIModel[]
  selectedModel: string
  onSelectModel: (modelId: string) => void
}

export function AgentSelector({ models, selectedModel, onSelectModel }: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedModelData = models.find(m => m.id === selectedModel)

  const getModelIcon = (model: AIModel) => {
    if (model.capabilities.includes('reasoning')) {
      return <BrainIcon size={14} className="text-purple-400" />
    }
    if (model.capabilities.includes('code-generation')) {
      return <CodeIcon size={14} className="text-blue-400" />
    }
    if (model.capabilities.includes('conversation')) {
      return <BotIcon size={14} className="text-green-400" />
    }
    return <ZapIcon size={14} className="text-yellow-400" />
  }

  const getCapabilityColor = (capability: string) => {
    const colors: Record<string, string> = {
      'reasoning': 'bg-purple-500/20 text-purple-300',
      'code-generation': 'bg-blue-500/20 text-blue-300',
      'code-review': 'bg-orange-500/20 text-orange-300',
      'debugging': 'bg-red-500/20 text-red-300',
      'analysis': 'bg-cyan-500/20 text-cyan-300',
      'conversation': 'bg-green-500/20 text-green-300',
      'code-completion': 'bg-indigo-500/20 text-indigo-300',
      'documentation': 'bg-gray-500/20 text-gray-300',
      'multilingual': 'bg-pink-500/20 text-pink-300'
    }
    return colors[capability] || 'bg-gray-500/20 text-gray-300'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 text-sm bg-secondary border border-border rounded hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-2">
          {selectedModelData && getModelIcon(selectedModelData)}
          <span className="truncate">
            {selectedModelData?.name || 'Select Model'}
          </span>
        </div>
        <ChevronDownIcon 
          size={14} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
            {models.map((model) => (
              <div
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id)
                  setIsOpen(false)
                }}
                className={`p-3 cursor-pointer hover:bg-accent transition-colors border-b border-border last:border-b-0 ${
                  selectedModel === model.id ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  {getModelIcon(model)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {model.name}
                      </h4>
                      <div className="text-xs text-muted-foreground">
                        {model.contextWindow.toLocaleString()} ctx
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {model.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {model.capabilities.slice(0, 3).map((capability) => (
                        <span
                          key={capability}
                          className={`px-1.5 py-0.5 text-xs rounded ${getCapabilityColor(capability)}`}
                        >
                          {capability}
                        </span>
                      ))}
                      {model.capabilities.length > 3 && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-gray-500/20 text-gray-300">
                          +{model.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{model.provider}</span>
                      <span>${model.costPerToken.toFixed(6)}/token</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
