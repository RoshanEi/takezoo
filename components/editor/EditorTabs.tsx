'use client'

import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FileNode } from '@/types/fileSystem'

interface OpenFile {
  id: string
  file: FileNode
  content: string
  isModified: boolean
  originalContent: string
}

interface EditorTabsProps {
  openFiles: OpenFile[]
  activeFileId: string | null
  onSelectFile: (fileId: string) => void
  onCloseFile: (fileId: string) => void
}

export function EditorTabs({
  openFiles,
  activeFileId,
  onSelectFile,
  onCloseFile
}: EditorTabsProps) {
  if (openFiles.length === 0) {
    return null
  }

  return (
    <div className="flex items-center overflow-x-auto flex-1">
      {openFiles.map((openFile) => (
        <div
          key={openFile.id}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm border-r border-border cursor-pointer group min-w-0",
            activeFileId === openFile.id
              ? "bg-background text-foreground"
              : "bg-secondary text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => onSelectFile(openFile.id)}
        >
          {/* File Icon */}
          <div className="flex-shrink-0">
            {getFileIcon(openFile.file)}
          </div>

          {/* File Name */}
          <span className="truncate max-w-[120px]">
            {openFile.file.name}
          </span>

          {/* Modified Indicator */}
          {openFile.isModified && (
            <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
          )}

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCloseFile(openFile.id)
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-accent rounded flex-shrink-0"
          >
            <XIcon size={12} />
          </button>
        </div>
      ))}
    </div>
  )
}

function getFileIcon(file: FileNode) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  // Return a simple colored dot for now - can be enhanced with actual icons later
  switch (extension) {
    case 'js':
    case 'jsx':
      return <div className="w-2 h-2 bg-yellow-400 rounded-full" />
    case 'ts':
    case 'tsx':
      return <div className="w-2 h-2 bg-blue-400 rounded-full" />
    case 'css':
    case 'scss':
    case 'sass':
      return <div className="w-2 h-2 bg-pink-400 rounded-full" />
    case 'html':
      return <div className="w-2 h-2 bg-orange-400 rounded-full" />
    case 'json':
      return <div className="w-2 h-2 bg-green-400 rounded-full" />
    case 'md':
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    case 'py':
      return <div className="w-2 h-2 bg-green-500 rounded-full" />
    case 'java':
      return <div className="w-2 h-2 bg-red-400 rounded-full" />
    default:
      return <div className="w-2 h-2 bg-muted-foreground rounded-full" />
  }
}
