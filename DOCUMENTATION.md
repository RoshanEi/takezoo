# 📚 Shinmen Takezo IDE - Technical Documentation

## 🏗️ Architecture Overview

Shinmen Takezo IDE is built as a modern web application using Next.js 14 with a component-based architecture. The application follows the principles of separation of concerns and modularity.

### Core Architecture Principles
- **Component-Based**: Modular React components for reusability
- **Type Safety**: Full TypeScript implementation
- **Client-Side First**: Browser-based with optional server features
- **AI-Integrated**: Native AI assistance throughout the application
- **Extensible**: Plugin-ready architecture for future enhancements

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.5+
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks + Zustand for global state
- **UI Components**: Custom components built on Radix UI primitives

### Editor & Terminal
- **Code Editor**: Monaco Editor (VS Code engine)
- **Terminal**: xterm.js with modern addons
- **File System**: Custom virtual file system with IndexedDB

### AI Integration
- **Provider**: CHUTS AI
- **Models**: Multiple specialized models (DeepSeek, Qwen)
- **Features**: Streaming responses, context awareness, cost tracking

## 📁 Project Structure

```
shinmen-takezo-ide/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Home page component
│   └── globals.css              # Global styles and CSS variables
├── components/                   # React components
│   ├── editor/                  # Monaco editor components
│   │   ├── EditorPanel.tsx      # Main editor container
│   │   ├── EditorTabs.tsx       # Tab management
│   │   └── MonacoEditor.tsx     # Monaco editor wrapper
│   ├── file-explorer/           # File management
│   │   ├── FileExplorer.tsx     # Main file explorer
│   │   └── FileTree.tsx         # Recursive file tree
│   ├── chat/                    # AI chat interface
│   │   ├── ChatPanel.tsx        # Main chat container
│   │   ├── ChatMessage.tsx      # Individual messages
│   │   └── AgentSelector.tsx    # AI model selection
│   ├── terminal/                # Terminal integration
│   │   └── TerminalPanel.tsx    # xterm.js wrapper
│   ├── layout/                  # Layout components
│   │   └── MainLayout.tsx       # IDE main layout
│   └── ui/                      # Reusable UI components
│       └── LoadingScreen.tsx    # Loading states
├── lib/                         # Core services and utilities
│   ├── aiService.ts            # AI integration service
│   ├── fileSystem.ts           # File system management
│   └── utils.ts                # Helper functions
├── types/                       # TypeScript definitions
│   ├── ai.ts                   # AI-related types
│   └── fileSystem.ts           # File system types
├── hooks/                       # Custom React hooks
└── public/                      # Static assets
```

## 🔌 Core Services

### AI Service (`lib/aiService.ts`)

The AI service handles all interactions with CHUTS AI:

```typescript
class AIService {
  // Send single message to AI
  async sendMessage(request: AIRequest): Promise<AIResponse>
  
  // Stream responses for real-time chat
  async *streamMessage(request: AIRequest): AsyncGenerator<AIStreamResponse>
  
  // Get available models
  getModels(): AIModel[]
  
  // Test connection
  async testConnection(): Promise<boolean>
}
```

**Features:**
- Multiple AI model support
- Streaming responses
- Context-aware requests
- Token usage tracking
- Error handling and retries

### File System Service (`lib/fileSystem.ts`)

Manages the virtual file system with browser persistence:

```typescript
class FileSystemService {
  // File operations
  async createFile(path: string, content?: string): Promise<FileNode>
  async readFile(path: string): Promise<string>
  async writeFile(path: string, content: string): Promise<void>
  async deleteFile(path: string): Promise<void>
  
  // Directory operations
  async createDirectory(path: string): Promise<FileNode>
  async listDirectory(path: string): Promise<FileNode[]>
  
  // Persistence
  async saveToIndexedDB(): Promise<void>
  async loadFromIndexedDB(): Promise<void>
}
```

**Features:**
- IndexedDB persistence
- File watching capabilities
- Project export/import
- Search functionality
- Real-time updates

## 🎨 Component Architecture

### Editor Panel (`components/editor/EditorPanel.tsx`)

The main editor component manages multiple open files:

```typescript
interface EditorPanelProps {
  fileSystem: FileSystemService
  aiService: AIService
}
```

**Responsibilities:**
- File tab management
- Content synchronization
- Save operations
- AI integration hooks

### Monaco Editor (`components/editor/MonacoEditor.tsx`)

Wrapper around Monaco Editor with IDE-specific features:

```typescript
interface MonacoEditorProps {
  file: FileNode
  content: string
  onChange: (content: string) => void
  onSave: () => void
  aiService: AIService
}
```

**Features:**
- Syntax highlighting for 50+ languages
- AI context menu actions
- Keyboard shortcuts
- Auto-completion
- Error diagnostics

### Chat Panel (`components/chat/ChatPanel.tsx`)

AI chat interface with model selection:

```typescript
interface ChatPanelProps {
  aiService: AIService
  fileSystem: FileSystemService
}
```

**Features:**
- Multi-model support
- Context-aware conversations
- Message history
- Code formatting in messages
- Token usage display

## 🔄 State Management

### Local Component State
- React hooks (`useState`, `useEffect`, `useRef`)
- Component-specific state management
- Event handling and side effects

### Global State (Future)
- Zustand for cross-component state
- File system state
- Editor preferences
- AI conversation history

## 🎯 Event System

### Custom Events
The application uses custom events for component communication:

```typescript
// File selection from explorer to editor
window.dispatchEvent(new CustomEvent('file-selected', {
  detail: { fileId: 'file-123' }
}))

// AI assistance requests from editor
window.dispatchEvent(new CustomEvent('ai-request', {
  detail: { type: 'explain', code: 'function example() {}' }
}))
```

## 🔐 Security Considerations

### Client-Side Security
- API keys stored in environment variables
- No sensitive data in localStorage
- XSS prevention through React's built-in protections
- Content Security Policy headers

### AI Integration Security
- Request validation
- Rate limiting (client-side)
- Error message sanitization
- Token usage monitoring

## 🚀 Performance Optimizations

### Code Splitting
- Dynamic imports for heavy components
- Lazy loading of Monaco Editor
- Route-based code splitting

### Memory Management
- Component cleanup in useEffect
- Event listener removal
- Monaco Editor disposal
- Terminal cleanup

### Caching
- IndexedDB for file persistence
- Browser caching for static assets
- AI response caching (future)

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Example test structure
describe('FileSystemService', () => {
  it('should create files correctly', async () => {
    const fs = new FileSystemService()
    const file = await fs.createFile('/test.js', 'console.log("test")')
    expect(file.name).toBe('test.js')
  })
})
```

### Integration Tests
- Component interaction testing
- AI service integration
- File system operations
- Editor functionality

### E2E Tests (Future)
- Full user workflows
- Cross-browser testing
- Performance testing
- Accessibility testing

## 🔧 Configuration

### Environment Variables
See `.env.example` for complete configuration options.

### Build Configuration
- Next.js configuration in `next.config.js`
- TypeScript configuration in `tsconfig.json`
- Tailwind configuration in `tailwind.config.js`
- PostCSS configuration in `postcss.config.js`

## 📊 Monitoring and Analytics

### Error Tracking
- Console error logging
- AI request error handling
- File system error recovery
- User-friendly error messages

### Performance Monitoring
- Component render times
- AI response times
- File operation performance
- Memory usage tracking

## 🔮 Future Enhancements

### Planned Features
1. **WebContainer Integration**: Full Node.js runtime in browser
2. **Git Integration**: Version control with visual diff
3. **Real-time Collaboration**: Multi-user editing
4. **Plugin System**: Extensible architecture
5. **Database Integration**: Direct database connections
6. **Mobile Support**: Responsive design improvements

### Technical Debt
- Implement proper error boundaries
- Add comprehensive test coverage
- Optimize bundle size
- Improve accessibility
- Add internationalization

## 📚 API Reference

### File System API
Detailed API documentation for file operations, search, and persistence.

### AI Service API
Complete reference for AI integration, model selection, and response handling.

### Component Props
TypeScript interfaces for all component props and their usage examples.

---

*"The way of strategy is the way of nature."* - Miyamoto Musashi
