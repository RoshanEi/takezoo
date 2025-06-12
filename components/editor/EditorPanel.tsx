'use client'

import { useState, useEffect } from 'react'
import { EditorTabs } from './EditorTabs'
import { MonacoEditor } from './MonacoEditor'
import { FileSystemService } from '@/lib/fileSystem'
import { AIService } from '@/lib/aiService'
import type { FileNode } from '@/types/fileSystem'
import { PlusIcon, XIcon } from 'lucide-react'

interface EditorPanelProps {
  fileSystem: FileSystemService
  aiService: AIService
}

interface OpenFile {
  id: string
  file: FileNode
  content: string
  isModified: boolean
  originalContent: string
}

export function EditorPanel({ fileSystem, aiService }: EditorPanelProps) {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Listen for file selection from file explorer
  useEffect(() => {
    const handleFileSelect = async (event: CustomEvent) => {
      const fileId = event.detail.fileId
      await openFile(fileId)
    }

    window.addEventListener('file-selected', handleFileSelect as EventListener)
    return () => {
      window.removeEventListener('file-selected', handleFileSelect as EventListener)
    }
  }, [])

  const openFile = async (fileId: string) => {
    try {
      setIsLoading(true)
      
      // Check if file is already open
      const existingFile = openFiles.find(f => f.id === fileId)
      if (existingFile) {
        setActiveFileId(fileId)
        return
      }

      const file = fileSystem.getFileById(fileId)
      if (!file || file.type !== 'file') return

      const content = await fileSystem.readFile(file.path)
      
      const openFile: OpenFile = {
        id: fileId,
        file,
        content,
        isModified: false,
        originalContent: content
      }

      setOpenFiles(prev => [...prev, openFile])
      setActiveFileId(fileId)
    } catch (error) {
      console.error('Failed to open file:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const closeFile = async (fileId: string) => {
    const file = openFiles.find(f => f.id === fileId)
    if (!file) return

    // Check if file has unsaved changes
    if (file.isModified) {
      const shouldSave = confirm(`"${file.file.name}" has unsaved changes. Save before closing?`)
      if (shouldSave) {
        await saveFile(fileId)
      }
    }

    setOpenFiles(prev => prev.filter(f => f.id !== fileId))
    
    // Set new active file
    if (activeFileId === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId)
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1].id : null)
    }
  }

  const saveFile = async (fileId: string) => {
    try {
      const file = openFiles.find(f => f.id === fileId)
      if (!file) return

      await fileSystem.writeFile(file.file.path, file.content)
      
      setOpenFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, isModified: false, originalContent: f.content }
          : f
      ))
    } catch (error) {
      console.error('Failed to save file:', error)
      alert('Failed to save file')
    }
  }

  const saveAllFiles = async () => {
    const modifiedFiles = openFiles.filter(f => f.isModified)
    for (const file of modifiedFiles) {
      await saveFile(file.id)
    }
  }

  const updateFileContent = (fileId: string, content: string) => {
    setOpenFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, content, isModified: content !== f.originalContent }
        : f
    ))
  }

  const createNewFile = async () => {
    try {
      const fileName = prompt('Enter file name:')
      if (!fileName) return

      const file = await fileSystem.createFile(`/${fileName}`)
      await openFile(file.id)
    } catch (error) {
      console.error('Failed to create file:', error)
      alert('Failed to create file')
    }
  }

  const activeFile = openFiles.find(f => f.id === activeFileId)

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-border bg-secondary">
        <EditorTabs
          openFiles={openFiles}
          activeFileId={activeFileId}
          onSelectFile={setActiveFileId}
          onCloseFile={closeFile}
        />
        
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={createNewFile}
            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
            title="New File"
          >
            <PlusIcon size={14} />
          </button>
          
          {openFiles.some(f => f.isModified) && (
            <button
              onClick={saveAllFiles}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              title="Save All"
            >
              Save All
            </button>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : activeFile ? (
          <MonacoEditor
            file={activeFile.file}
            content={activeFile.content}
            onChange={(content) => updateFileContent(activeFile.id, content)}
            onSave={() => saveFile(activeFile.id)}
            aiService={aiService}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Welcome to Shinmen Takezo IDE
              </h3>
              <p className="text-muted-foreground mb-4">
                Open a file from the explorer or create a new one to get started
              </p>
              <button
                onClick={createNewFile}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Create New File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
