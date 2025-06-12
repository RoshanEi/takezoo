'use client'

import { useState, useEffect } from 'react'
import { FileTree } from './FileTree'
import { FileSystemService } from '@/lib/fileSystem'
import type { FileNode } from '@/types/fileSystem'
import { 
  FolderIcon, 
  FileIcon, 
  PlusIcon, 
  FolderPlusIcon,
  SearchIcon,
  RefreshCwIcon
} from 'lucide-react'

interface FileExplorerProps {
  fileSystem: FileSystemService
}

export function FileExplorer({ fileSystem }: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  useEffect(() => {
    loadFiles()
  }, [fileSystem])

  const loadFiles = async () => {
    try {
      setIsLoading(true)
      const fileTree = await fileSystem.getFileTree()
      setFiles(fileTree)
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFile = async () => {
    try {
      const fileName = prompt('Enter file name:')
      if (!fileName) return

      const path = selectedFileId 
        ? `${getSelectedFilePath()}/${fileName}`
        : `/${fileName}`

      await fileSystem.createFile(path)
      await loadFiles()
    } catch (error) {
      console.error('Failed to create file:', error)
      alert('Failed to create file')
    }
  }

  const handleCreateFolder = async () => {
    try {
      const folderName = prompt('Enter folder name:')
      if (!folderName) return

      const path = selectedFileId 
        ? `${getSelectedFilePath()}/${folderName}`
        : `/${folderName}`

      await fileSystem.createDirectory(path)
      await loadFiles()
    } catch (error) {
      console.error('Failed to create folder:', error)
      alert('Failed to create folder')
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      const file = fileSystem.getFileById(fileId)
      if (!file) return

      const confirmed = confirm(`Are you sure you want to delete "${file.name}"?`)
      if (!confirmed) return

      await fileSystem.deleteFile(file.path)
      await loadFiles()
      
      if (selectedFileId === fileId) {
        setSelectedFileId(null)
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
      alert('Failed to delete file')
    }
  }

  const handleRenameFile = async (fileId: string) => {
    try {
      const file = fileSystem.getFileById(fileId)
      if (!file) return

      const newName = prompt('Enter new name:', file.name)
      if (!newName || newName === file.name) return

      const newPath = file.path.replace(file.name, newName)
      await fileSystem.renameFile(file.path, newPath)
      await loadFiles()
    } catch (error) {
      console.error('Failed to rename file:', error)
      alert('Failed to rename file')
    }
  }

  const getSelectedFilePath = (): string => {
    if (!selectedFileId) return ''
    const file = fileSystem.getFileById(selectedFileId)
    return file?.path || ''
  }

  const filteredFiles = searchQuery
    ? files.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-2 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">Explorer</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCreateFile}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="New File"
            >
              <FileIcon size={14} />
            </button>
            <button
              onClick={handleCreateFolder}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="New Folder"
            >
              <FolderPlusIcon size={14} />
            </button>
            <button
              onClick={loadFiles}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCwIcon size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading files...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {searchQuery ? 'No files found' : 'No files in project'}
          </div>
        ) : (
          <FileTree
            files={filteredFiles}
            fileSystem={fileSystem}
            selectedFileId={selectedFileId}
            onSelectFile={setSelectedFileId}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border text-xs text-muted-foreground">
        {files.length} items
      </div>
    </div>
  )
}
