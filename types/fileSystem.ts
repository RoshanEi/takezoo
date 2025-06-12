export interface FileNode {
  id: string
  name: string
  type: 'file' | 'directory'
  path: string
  parentId?: string
  children?: FileNode[]
  content?: string
  size?: number
  lastModified?: Date
  isOpen?: boolean
  isSelected?: boolean
  isModified?: boolean
  language?: string
}

export interface FileSystemState {
  files: Record<string, FileNode>
  rootFiles: string[]
  openFiles: string[]
  activeFileId?: string
  selectedFileId?: string
}

export interface FileOperation {
  type: 'create' | 'update' | 'delete' | 'rename' | 'move'
  fileId: string
  data?: any
  timestamp: Date
}

export interface FileSystemAPI {
  // File operations
  createFile: (path: string, content?: string) => Promise<FileNode>
  createDirectory: (path: string) => Promise<FileNode>
  readFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>
  renameFile: (oldPath: string, newPath: string) => Promise<void>
  moveFile: (oldPath: string, newPath: string) => Promise<void>
  
  // Directory operations
  listDirectory: (path: string) => Promise<FileNode[]>
  
  // File system state
  getFileTree: () => Promise<FileNode[]>
  watchFile: (path: string, callback: (content: string) => void) => () => void
  
  // Persistence
  saveToIndexedDB: () => Promise<void>
  loadFromIndexedDB: () => Promise<void>
  exportProject: () => Promise<Blob>
  importProject: (file: File) => Promise<void>
}

export interface SearchResult {
  fileId: string
  fileName: string
  filePath: string
  matches: SearchMatch[]
}

export interface SearchMatch {
  line: number
  column: number
  text: string
  preview: string
}

export interface FileSearchOptions {
  query: string
  caseSensitive?: boolean
  wholeWord?: boolean
  regex?: boolean
  includePatterns?: string[]
  excludePatterns?: string[]
  maxResults?: number
}

export interface RecentFile {
  fileId: string
  fileName: string
  filePath: string
  lastOpened: Date
}

export interface FileBookmark {
  id: string
  fileId: string
  fileName: string
  filePath: string
  line?: number
  column?: number
  description?: string
  createdAt: Date
}

export interface FileTemplate {
  id: string
  name: string
  description: string
  language: string
  content: string
  variables?: Record<string, string>
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  files: Array<{
    path: string
    content: string
    isTemplate?: boolean
  }>
  dependencies?: Record<string, string>
  scripts?: Record<string, string>
  variables?: Record<string, string>
}
