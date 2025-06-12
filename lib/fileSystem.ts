import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { FileNode, FileSystemAPI, SearchResult, FileSearchOptions } from '@/types/fileSystem'
import { generateId, getLanguageFromExtension, getFileExtension } from './utils'

interface FileSystemDB extends DBSchema {
  files: {
    key: string
    value: FileNode
  }
  metadata: {
    key: string
    value: any
  }
}

export class FileSystemService implements FileSystemAPI {
  private db?: IDBPDatabase<FileSystemDB>
  private files: Map<string, FileNode> = new Map()
  private watchers: Map<string, Set<(content: string) => void>> = new Map()

  async initialize(): Promise<void> {
    this.db = await openDB<FileSystemDB>('shinmen-ide-fs', 1, {
      upgrade(db) {
        db.createObjectStore('files', { keyPath: 'id' })
        db.createObjectStore('metadata', { keyPath: 'key' })
      }
    })

    await this.loadFromIndexedDB()
    
    // Create default project structure if empty
    if (this.files.size === 0) {
      await this.createDefaultProject()
    }
  }

  async createFile(path: string, content: string = ''): Promise<FileNode> {
    const id = generateId()
    const name = path.split('/').pop() || 'untitled'
    const parentPath = path.substring(0, path.lastIndexOf('/'))
    const extension = getFileExtension(name)
    const language = getLanguageFromExtension(extension)

    const file: FileNode = {
      id,
      name,
      type: 'file',
      path,
      content,
      size: content.length,
      lastModified: new Date(),
      language,
      isModified: false
    }

    // Find parent directory
    if (parentPath) {
      const parent = Array.from(this.files.values()).find(f => f.path === parentPath && f.type === 'directory')
      if (parent) {
        file.parentId = parent.id
        if (!parent.children) parent.children = []
        parent.children.push(file)
      }
    }

    this.files.set(id, file)
    await this.saveToIndexedDB()
    
    return file
  }

  async createDirectory(path: string): Promise<FileNode> {
    const id = generateId()
    const name = path.split('/').pop() || 'untitled'
    const parentPath = path.substring(0, path.lastIndexOf('/'))

    const directory: FileNode = {
      id,
      name,
      type: 'directory',
      path,
      children: [],
      lastModified: new Date()
    }

    // Find parent directory
    if (parentPath) {
      const parent = Array.from(this.files.values()).find(f => f.path === parentPath && f.type === 'directory')
      if (parent) {
        directory.parentId = parent.id
        if (!parent.children) parent.children = []
        parent.children.push(directory)
      }
    }

    this.files.set(id, directory)
    await this.saveToIndexedDB()
    
    return directory
  }

  async readFile(path: string): Promise<string> {
    const file = Array.from(this.files.values()).find(f => f.path === path && f.type === 'file')
    if (!file) {
      throw new Error(`File not found: ${path}`)
    }
    return file.content || ''
  }

  async writeFile(path: string, content: string): Promise<void> {
    let file = Array.from(this.files.values()).find(f => f.path === path && f.type === 'file')
    
    if (!file) {
      file = await this.createFile(path, content)
    } else {
      file.content = content
      file.size = content.length
      file.lastModified = new Date()
      file.isModified = true
    }

    this.files.set(file.id, file)
    await this.saveToIndexedDB()

    // Notify watchers
    const watchers = this.watchers.get(path)
    if (watchers) {
      watchers.forEach(callback => callback(content))
    }
  }

  async deleteFile(path: string): Promise<void> {
    const file = Array.from(this.files.values()).find(f => f.path === path)
    if (!file) {
      throw new Error(`File not found: ${path}`)
    }

    // Remove from parent's children
    if (file.parentId) {
      const parent = this.files.get(file.parentId)
      if (parent && parent.children) {
        parent.children = parent.children.filter(child => child.id !== file.id)
      }
    }

    // If it's a directory, recursively delete children
    if (file.type === 'directory' && file.children) {
      for (const child of file.children) {
        await this.deleteFile(child.path)
      }
    }

    this.files.delete(file.id)
    await this.saveToIndexedDB()
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    const file = Array.from(this.files.values()).find(f => f.path === oldPath)
    if (!file) {
      throw new Error(`File not found: ${oldPath}`)
    }

    const newName = newPath.split('/').pop() || 'untitled'
    file.name = newName
    file.path = newPath

    if (file.type === 'file') {
      const extension = getFileExtension(newName)
      file.language = getLanguageFromExtension(extension)
    }

    // Update children paths if it's a directory
    if (file.type === 'directory' && file.children) {
      await this.updateChildrenPaths(file, oldPath, newPath)
    }

    this.files.set(file.id, file)
    await this.saveToIndexedDB()
  }

  async moveFile(oldPath: string, newPath: string): Promise<void> {
    // For now, implement as rename
    await this.renameFile(oldPath, newPath)
  }

  async listDirectory(path: string): Promise<FileNode[]> {
    const directory = Array.from(this.files.values()).find(f => f.path === path && f.type === 'directory')
    if (!directory) {
      throw new Error(`Directory not found: ${path}`)
    }
    return directory.children || []
  }

  async getFileTree(): Promise<FileNode[]> {
    const rootFiles = Array.from(this.files.values()).filter(f => !f.parentId)
    return this.sortFiles(rootFiles)
  }

  watchFile(path: string, callback: (content: string) => void): () => void {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, new Set())
    }
    this.watchers.get(path)!.add(callback)

    return () => {
      const watchers = this.watchers.get(path)
      if (watchers) {
        watchers.delete(callback)
        if (watchers.size === 0) {
          this.watchers.delete(path)
        }
      }
    }
  }

  async saveToIndexedDB(): Promise<void> {
    if (!this.db) return

    const tx = this.db.transaction(['files'], 'readwrite')
    const store = tx.objectStore('files')

    // Clear existing files
    await store.clear()

    // Save all files
    for (const file of this.files.values()) {
      await store.add(file)
    }

    await tx.done
  }

  async loadFromIndexedDB(): Promise<void> {
    if (!this.db) return

    const tx = this.db.transaction(['files'], 'readonly')
    const store = tx.objectStore('files')
    const allFiles = await store.getAll()

    this.files.clear()
    for (const file of allFiles) {
      this.files.set(file.id, file)
    }

    // Rebuild parent-child relationships
    this.rebuildFileTree()
  }

  async exportProject(): Promise<Blob> {
    const projectData = {
      files: Array.from(this.files.values()),
      metadata: {
        name: 'Shinmen Takezo Project',
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      }
    }

    return new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
  }

  async importProject(file: File): Promise<void> {
    const text = await file.text()
    const projectData = JSON.parse(text)

    this.files.clear()
    for (const fileNode of projectData.files) {
      this.files.set(fileNode.id, fileNode)
    }

    this.rebuildFileTree()
    await this.saveToIndexedDB()
  }

  private async createDefaultProject(): Promise<void> {
    // Create root directory
    const root = await this.createDirectory('/')
    
    // Create sample files
    await this.createFile('/README.md', `# Shinmen Takezo IDE

Welcome to your new project! This is a comprehensive web-based IDE with AI assistance.

## Features

- Monaco Editor with syntax highlighting
- AI-powered code assistance
- Integrated terminal
- File management
- Real-time collaboration

## Getting Started

1. Create new files using the file explorer
2. Use the AI chat panel for assistance
3. Run commands in the integrated terminal
4. Enjoy coding!
`)

    await this.createFile('/index.js', `// Welcome to Shinmen Takezo IDE
console.log('Hello, World!');

function greet(name) {
  return \`Hello, \${name}! Welcome to the IDE.\`;
}

const message = greet('Developer');
console.log(message);
`)

    await this.createFile('/style.css', `/* Shinmen Takezo IDE Styles */
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #1a1a1a;
  color: #ffffff;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #3b82f6;
  text-align: center;
}

.welcome-message {
  background: #2d2d2d;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}
`)

    await this.saveToIndexedDB()
  }

  private rebuildFileTree(): void {
    // Clear existing children arrays
    for (const file of this.files.values()) {
      if (file.type === 'directory') {
        file.children = []
      }
    }

    // Rebuild parent-child relationships
    for (const file of this.files.values()) {
      if (file.parentId) {
        const parent = this.files.get(file.parentId)
        if (parent && parent.type === 'directory') {
          if (!parent.children) parent.children = []
          parent.children.push(file)
        }
      }
    }

    // Sort children in each directory
    for (const file of this.files.values()) {
      if (file.type === 'directory' && file.children) {
        file.children = this.sortFiles(file.children)
      }
    }
  }

  private sortFiles(files: FileNode[]): FileNode[] {
    return files.sort((a, b) => {
      // Directories first
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      // Then alphabetically
      return a.name.localeCompare(b.name)
    })
  }

  private async updateChildrenPaths(directory: FileNode, oldPath: string, newPath: string): Promise<void> {
    if (!directory.children) return

    for (const child of directory.children) {
      const oldChildPath = child.path
      child.path = child.path.replace(oldPath, newPath)

      if (child.type === 'directory' && child.children) {
        await this.updateChildrenPaths(child, oldChildPath, child.path)
      }
    }
  }

  getFileById(id: string): FileNode | undefined {
    return this.files.get(id)
  }

  getFileByPath(path: string): FileNode | undefined {
    return Array.from(this.files.values()).find(f => f.path === path)
  }

  getAllFiles(): FileNode[] {
    return Array.from(this.files.values())
  }
}
