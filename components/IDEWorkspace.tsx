'use client'

import { useEffect, useState } from 'react'
// import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { FileExplorer } from './file-explorer/FileExplorer'
import { EditorPanel } from './editor/EditorPanel'
import { ChatPanel } from './chat/ChatPanel'
import { TerminalPanel } from './terminal/TerminalPanel'
import { FileSystemService } from '@/lib/fileSystem'
import { AIService } from '@/lib/aiService'
import { LoadingScreen } from './ui/LoadingScreen'

export default function IDEWorkspace() {
  const [isLoading, setIsLoading] = useState(true)
  const [fileSystem, setFileSystem] = useState<FileSystemService | null>(null)
  const [aiService, setAIService] = useState<AIService | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeServices() {
      try {
        // Initialize File System
        const fs = new FileSystemService()
        await fs.initialize()
        setFileSystem(fs)

        // Initialize AI Service
        const ai = new AIService()
        setAIService(ai)

        // Test AI connection
        const isConnected = await ai.testConnection()
        if (!isConnected) {
          console.warn('AI service connection test failed, but continuing...')
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Failed to initialize services:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setIsLoading(false)
      }
    }

    initializeServices()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">
            Initialization Error
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!fileSystem || !aiService) {
    return <LoadingScreen />
  }

  return (
    <div className="h-full w-full flex">
      {/* Left Panel - File Explorer */}
      <div className="w-64 h-full border-r border-border">
        <FileExplorer fileSystem={fileSystem} />
      </div>

      {/* Center Panel - Editor and Terminal */}
      <div className="flex-1 h-full flex flex-col">
        {/* Editor */}
        <div className="flex-1 h-2/3">
          <EditorPanel fileSystem={fileSystem} aiService={aiService} />
        </div>

        {/* Terminal */}
        <div className="h-1/3 border-t border-border">
          <TerminalPanel />
        </div>
      </div>

      {/* Right Panel - AI Chat */}
      <div className="w-80 h-full border-l border-border">
        <ChatPanel aiService={aiService} fileSystem={fileSystem} />
      </div>
    </div>
  )
}
