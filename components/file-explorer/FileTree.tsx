'use client'

import { useState } from 'react'
import { FileNode } from '@/types/fileSystem'
import { FileSystemService } from '@/lib/fileSystem'
import { 
  FileIcon, 
  FolderIcon, 
  FolderOpenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  CopyIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileTreeProps {
  files: FileNode[]
  fileSystem: FileSystemService
  selectedFileId: string | null
  onSelectFile: (fileId: string) => void
  onDeleteFile: (fileId: string) => void
  onRenameFile: (fileId: string) => void
  level?: number
}

export function FileTree({
  files,
  fileSystem,
  selectedFileId,
  onSelectFile,
  onDeleteFile,
  onRenameFile,
  level = 0
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    fileId: string
    x: number
    y: number
  } | null>(null)

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'directory') {
      toggleFolder(file.id)
    } else {
      onSelectFile(file.id)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault()
    setContextMenu({
      fileId,
      x: e.clientX,
      y: e.clientY
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'directory') {
      return expandedFolders.has(file.id) ? (
        <FolderOpenIcon size={16} className="text-blue-400" />
      ) : (
        <FolderIcon size={16} className="text-blue-400" />
      )
    }

    // File type specific icons
    const extension = file.name.split('.').pop()?.toLowerCase()
    const iconClass = "text-muted-foreground"
    
    switch (extension) {
      case 'js':
      case 'jsx':
        return <FileIcon size={16} className="text-yellow-400" />
      case 'ts':
      case 'tsx':
        return <FileIcon size={16} className="text-blue-400" />
      case 'css':
      case 'scss':
      case 'sass':
        return <FileIcon size={16} className="text-pink-400" />
      case 'html':
        return <FileIcon size={16} className="text-orange-400" />
      case 'json':
        return <FileIcon size={16} className="text-green-400" />
      case 'md':
        return <FileIcon size={16} className="text-gray-400" />
      case 'py':
        return <FileIcon size={16} className="text-green-500" />
      case 'java':
        return <FileIcon size={16} className="text-red-400" />
      default:
        return <FileIcon size={16} className={iconClass} />
    }
  }

  return (
    <>
      <div className="select-none">
        {files.map((file) => (
          <div key={file.id}>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent group",
                selectedFileId === file.id && "bg-accent text-accent-foreground",
                file.isModified && "text-yellow-500"
              )}
              style={{ paddingLeft: `${8 + level * 16}px` }}
              onClick={() => handleFileClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file.id)}
            >
              {/* Expand/Collapse Icon */}
              {file.type === 'directory' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFolder(file.id)
                  }}
                  className="p-0.5 hover:bg-accent rounded"
                >
                  {expandedFolders.has(file.id) ? (
                    <ChevronDownIcon size={12} />
                  ) : (
                    <ChevronRightIcon size={12} />
                  )}
                </button>
              )}

              {/* File/Folder Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(file)}
              </div>

              {/* File Name */}
              <span className="flex-1 truncate">
                {file.name}
              </span>

              {/* Modified Indicator */}
              {file.isModified && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
              )}

              {/* Context Menu Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleContextMenu(e, file.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-accent rounded"
              >
                <MoreHorizontalIcon size={12} />
              </button>
            </div>

            {/* Render Children */}
            {file.type === 'directory' && 
             expandedFolders.has(file.id) && 
             file.children && 
             file.children.length > 0 && (
              <FileTree
                files={file.children}
                fileSystem={fileSystem}
                selectedFileId={selectedFileId}
                onSelectFile={onSelectFile}
                onDeleteFile={onDeleteFile}
                onRenameFile={onRenameFile}
                level={level + 1}
              />
            )}
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[120px]"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
          >
            <button
              onClick={() => {
                onRenameFile(contextMenu.fileId)
                closeContextMenu()
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
            >
              <EditIcon size={14} />
              Rename
            </button>
            <button
              onClick={() => {
                // TODO: Implement copy functionality
                closeContextMenu()
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
            >
              <CopyIcon size={14} />
              Copy
            </button>
            <hr className="my-1 border-border" />
            <button
              onClick={() => {
                onDeleteFile(contextMenu.fileId)
                closeContextMenu()
              }}
              className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
            >
              <TrashIcon size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </>
  )
}
